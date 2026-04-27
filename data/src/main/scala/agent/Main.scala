package agent

import sttp.client3._
import sttp.client3.circe._
import io.circe.generic.auto._
import java.util.concurrent.{Executors, TimeUnit}

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
  val GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE"
  val GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

  val query = """
    query {
      viewer {
        repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            languages(first: 5) {
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

  def fetchData(): Unit = {
    println(s"[AGENT] Starting data extraction at ${java.time.Instant.now()}")
    
    val backend = HttpClientSyncBackend()
    val request = basicRequest
      .post(uri"$GITHUB_GRAPHQL_URL")
      .header("Authorization", s"Bearer $GITHUB_TOKEN")
      .body(Map("query" -> query))
      .response(asJson[GithubResponse])

    val response = request.send(backend)

    response.body match {
      case Left(error) => 
        println(s"[ERROR] Failed to fetch data: $error")
      case Right(data) =>
        println("[SUCCESS] Data extracted successfully")
        data.data.viewer.repositories.nodes.foreach { repo =>
          val langs = repo.languages.edges.map(e => s"${e.node.name}(${e.size}B)").mkString(", ")
          println(s"  -> REPO: ${repo.name} | LANGS: $langs")
        }
    }
  }

  def main(args: Array[String]): Unit = {
    val scheduler = Executors.newSingleThreadScheduledExecutor()
    
    println("[SYSTEM] DATA_INGESTION_AGENT INITIALIZED")
    println("[SYSTEM] POLLING_INTERVAL: 60 SECONDS")

    val task = new Runnable {
      def run(): Unit = {
        try {
          fetchData()
        } catch {
          case e: Exception => println(s"[CRITICAL] Agent crashed: ${e.getMessage}")
        }
      }
    }

    scheduler.scheduleAtFixedRate(task, 0, 60, TimeUnit.SECONDS)
  }
}
