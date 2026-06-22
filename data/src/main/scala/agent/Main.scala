package agent

import java.util.concurrent.{Executors, TimeUnit}
import agent.db.ClickHouse
import agent.github.GithubClient

object Main {

  def runExtractionCycle(conn: java.sql.Connection): Unit = {
    val token = sys.env.get("GITHUB_TOKEN") match {
      case Some(t) => t
      case None => 
        println("[ERROR] GITHUB_TOKEN environment variable is not set. Skipping ingestion.")
        return
    }

    println(s"[AGENT] Starting data extraction at ${java.time.Instant.now()}")
    
    GithubClient.fetchData(token) match {
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

        ClickHouse.upsertLanguages(conn, langMap)
    }
  }

  def main(args: Array[String]): Unit = {
    val scheduler = Executors.newSingleThreadScheduledExecutor()
    
    println("[SYSTEM] DATA_INGESTION_AGENT INITIALIZED")
    println("[SYSTEM] POLLING_INTERVAL: 60 SECONDS")
    println("[SYSTEM] Waiting for ClickHouse connection...")

    val conn = ClickHouse.initDB()
    println("[SYSTEM] Connected to ClickHouse")

    val task = new Runnable {
      def run(): Unit = {
        try {
          runExtractionCycle(conn)
        } catch {
          case e: Exception => println(s"[CRITICAL] Agent crashed: ${e.getMessage}")
        }
      }
    }

    scheduler.scheduleAtFixedRate(task, 0, 60, TimeUnit.SECONDS)
  }
}
