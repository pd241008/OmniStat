package agent.github

import sttp.client3._
import sttp.client3.circe._
import io.circe.generic.auto._
import agent.models._

object GithubClient {
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
            // TODO: Phase 4 - Expand this GraphQL query to fetch temporal commit data.
            // We need to fetch `defaultBranchRef` -> `target` -> `history` to calculate 
            // commit velocity and power the Temporal Heatmapping visualizations.
          }
        }
      }
    }
  """

  def fetchData(token: String): Either[String, GithubResponse] = {
    val backend = HttpClientSyncBackend()
    val request = basicRequest
      .post(uri"$GITHUB_GRAPHQL_URL")
      .header("Authorization", s"Bearer $token")
      .body(Map("query" -> query))
      .response(asJson[GithubResponse])

    val response = request.send(backend)

    response.body match {
      case Left(error) => Left(error.getMessage)
      case Right(data) => Right(data)
    }
  }
}
