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
    stmt.close()
    conn
  }

  def upsertLanguages(conn: Connection, langMap: scala.collection.mutable.Map[String, Long]): Unit = {
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
