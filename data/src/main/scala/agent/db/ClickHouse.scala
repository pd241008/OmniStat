package agent.db

import java.sql.{Connection, DriverManager}

object ClickHouse {

  def initDB(): Connection = {
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
    stmt.execute("""
      CREATE TABLE IF NOT EXISTS commit_metrics (
        repo_name String,
        committed_at DateTime,
        message String DEFAULT '',
        updated_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY (repo_name, committed_at)
    """)
    stmt.close()
    conn
  }

  def upsertLanguages(conn: Connection, langMap: Map[String, Long]): Unit = {
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

  def upsertCommits(conn: Connection, commits: Seq[(String, String, String)]): Unit = {
    if (commits.isEmpty) {
      println("[INFO] No commit data to insert")
      return
    }

    val insertStmt = conn.prepareStatement("INSERT INTO commit_metrics (repo_name, committed_at, message) VALUES (?, ?, ?)")
    
    commits.foreach { case (repoName, committedAt, message) =>
      insertStmt.setString(1, repoName)
      // Convert ISO 8601 to ClickHouse DateTime format: "2024-01-15 10:30:00"
      val chDate = committedAt.replace("T", " ").replace("Z", "").take(19)
      insertStmt.setString(2, chDate)
      insertStmt.setString(3, if (message.length > 200) message.take(200) else message)
      insertStmt.addBatch()
    }
    
    insertStmt.executeBatch()
    insertStmt.close()
    println(s"[SUCCESS] Inserted ${commits.size} commit records in ClickHouse")
  }
}
