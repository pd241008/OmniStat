package agent

import sttp.client3._
import sttp.client3.circe._
import io.circe.generic.auto._
import java.util.concurrent.{Executors, TimeUnit}
import java.sql.DriverManager

// GraphQL Response Models
case class LanguageNode(name: String)
case class LanguageEdge(size: Int, node: LanguageNode)
case class Languages(edges: List[LanguageEdge])
case class Repository(name: String, languages: Languages)
case class User(repositories: RepositoryConnection)
case class RepositoryConnection(nodes: List[Repository])
case class GithubData(viewer: User)
case class GithubResponse(data: GithubData)

object GithubAgent {
  val GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

  val query = """
    query {
      viewer {
        repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            languages(first: 10) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  """

  def initDB(): java.sql.Connection = {
    val url = sys.env.getOrElse("CLICKHOUSE_URL", "jdbc:ch://localhost:8123/default")
    val user = sys.env.getOrElse("CLICKHOUSE_USER", "default")
    val password = sys.env.getOrElse("CLICKHOUSE_PASSWORD", "")
    
    val conn = DriverManager.getConnection(url, user, password)
    val stmt = conn.createStatement()
    // Using MergeTree as requested
    stmt.execute("""
      CREATE TABLE IF NOT EXISTS repo_languages (
        language String,
        byte_count Int64,
        updated_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY language
    """)
    stmt.execute("""
      CREATE TABLE IF NOT EXISTS system_metrics (
        id UUID DEFAULT generateUUIDv4(),
        name String,
        value Float64,
        updated_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY id
    """)
    stmt.close()
    conn
  }

  def fetchData(conn: java.sql.Connection): Unit = {
    val token = sys.env.get("GITHUB_TOKEN") match {
      case Some(t) => t
      case None => 
        println("[ERROR] GITHUB_TOKEN environment variable is not set. Skipping ingestion.")
        return
    }

    println(s"[AGENT] Starting data extraction at ${java.time.Instant.now()}")
    
    val backend = HttpClientSyncBackend()
    val request = basicRequest
      .post(uri"$GITHUB_GRAPHQL_URL")
      .header("Authorization", s"Bearer $token")
      .body(Map("query" -> query))
      .response(asJson[GithubResponse])

    val response = request.send(backend)

    response.body match {
      case Left(error) => 
        println(s"[ERROR] Failed to fetch data: $error")
      case Right(data) =>
        println("[SUCCESS] Data extracted successfully")
        
        // Aggregate languages
        val langMap = scala.collection.mutable.Map[String, Long]().withDefaultValue(0L)
        
        data.data.viewer.repositories.nodes.foreach { repo =>
          repo.languages.edges.foreach { e =>
            langMap(e.node.name) += e.size
          }
        }

        // Upsert logic for ClickHouse
        val insertStmt = conn.prepareStatement("INSERT INTO repo_languages (language, byte_count) VALUES (?, ?)")
        
        langMap.foreach { case (lang, bytes) =>
          insertStmt.setString(1, lang)
          insertStmt.setLong(2, bytes)
          insertStmt.addBatch()
        }
        
        insertStmt.executeBatch()
        insertStmt.close()
        println(s"[SUCCESS] Inserted/Updated ${langMap.size} language metrics in ClickHouse")
    }
  }

  def main(args: Array[String]): Unit = {
    val scheduler = Executors.newSingleThreadScheduledExecutor()
    
    println("[SYSTEM] DATA_INGESTION_AGENT INITIALIZED")
    println("[SYSTEM] POLLING_INTERVAL: 60 SECONDS")
    println("[SYSTEM] Waiting for ClickHouse connection...")

    val conn = initDB()
    println("[SYSTEM] Connected to ClickHouse")

    val task = new Runnable {
      def run(): Unit = {
        try {
          fetchData(conn)
        } catch {
          case e: Exception => println(s"[CRITICAL] Agent crashed: ${e.getMessage}")
        }
      }
    }

    scheduler.scheduleAtFixedRate(task, 0, 60, TimeUnit.SECONDS)
  }
}
