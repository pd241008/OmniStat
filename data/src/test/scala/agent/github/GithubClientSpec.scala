package agent.github

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.client3._
import sttp.client3.testing._
import agent.models._

class GithubClientSpec extends AnyFlatSpec with Matchers {

  val validEmptyResponse = """{"data": {"viewer": {"repositories": {"nodes": []}}}}"""

  def repoWith(name: String, hasDefaultBranch: Boolean = false, commits: String = ""): String = {
    val branchField = if (hasDefaultBranch) {
      s""""defaultBranchRef": {"target": {"history": {"edges": [$commits]}}}"""
    } else {
      """"defaultBranchRef": null"""
    }
    s"""{"name": "$name", "languages": {"edges": [{"size": 100, "node": {"name": "Scala"}}]}, $branchField}"""
  }

  "fetchDataWithBackend" should "return Right with valid response on success" in {
    val json = s"""
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [${repoWith("test-repo")}]
          }
        }
      }
    }
    """

    val backend = SttpBackendStub.synchronous
      .whenRequestMatches(_ => true)
      .thenRespond(json)

    val result = GithubClient.fetchDataWithBackend("test-token", backend)
    result.isRight shouldBe true
    val response = result.toOption.get
    response.data.viewer.repositories.nodes should have length 1
    response.data.viewer.repositories.nodes.head.name shouldBe "test-repo"
  }

  it should "return Left on HTTP error" in {
    val backend = SttpBackendStub.synchronous
      .whenRequestMatches(_ => true)
      .thenRespondWithCode(sttp.model.StatusCode(401), "Unauthorized")

    val result = GithubClient.fetchDataWithBackend("bad-token", backend)
    result.isLeft shouldBe true
  }

  it should "return Left on malformed JSON response" in {
    val backend = SttpBackendStub.synchronous
      .whenRequestMatches(_ => true)
      .thenRespond("{invalid json}")

    val result = GithubClient.fetchDataWithBackend("test-token", backend)
    result.isLeft shouldBe true
  }

  it should "include the Authorization header" in {
    var capturedRequest: Option[Request[_, _]] = None

    val backend = SttpBackendStub.synchronous
      .whenRequestMatches { req =>
        capturedRequest = Some(req)
        true
      }
      .thenRespond(validEmptyResponse)

    GithubClient.fetchDataWithBackend("my-secret-token", backend)

    capturedRequest shouldBe defined
    capturedRequest.get.headers.exists { h =>
      h.name == "Authorization" && h.value == "Bearer my-secret-token"
    } shouldBe true
  }

  it should "POST to the GitHub GraphQL URL" in {
    var capturedRequest: Option[Request[_, _]] = None

    val backend = SttpBackendStub.synchronous
      .whenRequestMatches { req =>
        capturedRequest = Some(req)
        true
      }
      .thenRespond(validEmptyResponse)

    GithubClient.fetchDataWithBackend("test-token", backend)

    capturedRequest shouldBe defined
    capturedRequest.get.uri.toString() should include("api.github.com/graphql")
    capturedRequest.get.method.method shouldBe "POST"
  }

  it should "return Right with commit data when present" in {
    val commitsJson = """{"node": {"committedDate": "2024-01-15T10:30:00Z", "message": "Initial"}}"""
    val json = s"""
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [${repoWith("committed-repo", hasDefaultBranch = true, commits = commitsJson)}]
          }
        }
      }
    }
    """

    val backend = SttpBackendStub.synchronous
      .whenRequestMatches(_ => true)
      .thenRespond(json)

    val result = GithubClient.fetchDataWithBackend("test-token", backend)
    result.isRight shouldBe true
    val repo = result.toOption.get.data.viewer.repositories.nodes.head
    repo.defaultBranchRef shouldBe defined
    repo.defaultBranchRef.get.target shouldBe defined
    repo.defaultBranchRef.get.target.get.history.edges should have length 1
    repo.defaultBranchRef.get.target.get.history.edges.head.node.committedDate shouldBe "2024-01-15T10:30:00Z"
  }

  it should "handle repos without a default branch" in {
    val json = validEmptyResponse
    val backend = SttpBackendStub.synchronous
      .whenRequestMatches(_ => true)
      .thenRespond(json)

    val result = GithubClient.fetchDataWithBackend("test-token", backend)
    result.isRight shouldBe true
    result.toOption.get.data.viewer.repositories.nodes shouldBe empty
  }
}
