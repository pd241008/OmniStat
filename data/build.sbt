name := "code-telemetry-data"
version := "0.1"
scalaVersion := "2.13.12"

val sttpVersion = "3.9.0"
val circeVersion = "0.14.6"

libraryDependencies ++= Seq(
  "com.softwaremill.sttp.client3" %% "core" % sttpVersion,
  "com.softwaremill.sttp.client3" %% "circe" % sttpVersion,
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "com.clickhouse" % "clickhouse-jdbc" % "0.6.0",
  "org.scalatest" %% "scalatest" % "3.2.18" % Test,
  "org.scalamock" %% "scalamock" % "5.2.0" % Test
)

Test / parallelExecution := false
