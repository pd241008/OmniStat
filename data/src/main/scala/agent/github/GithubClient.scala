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
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100) {
                    edges {
                      node {
                        committedDate
                        message
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  """

  def fetchData(token: String): Either[String, GithubResponse] = {
    val backend = HttpClientSyncBackend()
    fetchDataWithBackend(token, backend)
  }

  def fetchDataWithBackend(token: String, backend: SttpBackend[Identity, Any]): Either[String, GithubResponse] = {
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
