package agent

import java.util.concurrent.{Executors, TimeUnit}
import agent.db.ClickHouse
import agent.github.GithubClient
import agent.models.GithubResponse

object Main {

  def aggregateLanguages(data: GithubResponse): Map[String, Long] = {
    data.data.viewer.repositories.nodes.flatMap { repo =>
      repo.languages.edges.map { e =>
        e.node.name -> e.size.toLong
      }
    }.groupMapReduce(_._1)(_._2)(_ + _)
  }

  def aggregateCommits(data: GithubResponse): Seq[(String, String, String)] = {
    data.data.viewer.repositories.nodes.flatMap { repo =>
      repo.defaultBranchRef.flatMap(_.target).map(_.history.edges).getOrElse(Nil).map { edge =>
        (repo.name, edge.node.committedDate, edge.node.message)
      }
    }
  }

  def runExtractionCycle(conn: java.sql.Connection): Unit = {
    val token = sys.env.getOrElse("GITHUB_TOKEN", "") match {
      case "" =>
        println("[ERROR] GITHUB_TOKEN environment variable is not set. Skipping ingestion.")
        return
      case t => t
    }

    println(s"[AGENT] Starting data extraction at ${java.time.Instant.now()}")
    
    GithubClient.fetchData(token) match {
      case Left(error) => 
        println(s"[ERROR] Failed to fetch data: $error")
      case Right(data) =>
        println("[SUCCESS] Data extracted successfully")
        val langMap = aggregateLanguages(data)
        ClickHouse.upsertLanguages(conn, langMap)
        val commits = aggregateCommits(data)
        ClickHouse.upsertCommits(conn, commits)
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

    Runtime.getRuntime.addShutdownHook(new Thread {
      override def run(): Unit = {
        println("\n[SYSTEM] Shutting down agent...")
        scheduler.shutdown()
        try {
          if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
            scheduler.shutdownNow()
          }
        } catch {
          case _: InterruptedException => scheduler.shutdownNow()
        }
        conn.close()
        println("[SYSTEM] Agent terminated.")
      }
    })
  }
}
