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
  "io.circe" %% "circe-parser" % circeVersion
)
