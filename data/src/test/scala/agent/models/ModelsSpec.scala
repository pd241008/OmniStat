package agent.models

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import io.circe.parser._
import io.circe.generic.auto._

class ModelsSpec extends AnyFlatSpec with Matchers {

  "GithubResponse" should "decode a valid GraphQL response" in {
    val json = """
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [
              {
                "name": "my-repo",
                "languages": {
                  "edges": [
                    {"size": 5000, "node": {"name": "Scala"}},
                    {"size": 3000, "node": {"name": "Go"}}
                  ]
                },
                "defaultBranchRef": null
              },
              {
                "name": "another-repo",
                "languages": {
                  "edges": [
                    {"size": 2000, "node": {"name": "Scala"}}
                  ]
                },
                "defaultBranchRef": null
              }
            ]
          }
        }
      }
    }
    """

    val result = decode[GithubResponse](json)
    result.isRight shouldBe true

    val response = result.toOption.get
    response.data.viewer.repositories.nodes should have length 2
    response.data.viewer.repositories.nodes.head.name shouldBe "my-repo"
    response.data.viewer.repositories.nodes.head.languages.edges should have length 2
    response.data.viewer.repositories.nodes.head.languages.edges.head.size shouldBe 5000
    response.data.viewer.repositories.nodes.head.languages.edges.head.node.name shouldBe "Scala"
  }

  it should "handle empty repositories" in {
    val json = """
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": []
          }
        }
      }
    }
    """

    val result = decode[GithubResponse](json)
    result.isRight shouldBe true
    result.toOption.get.data.viewer.repositories.nodes shouldBe empty
  }

  it should "handle empty languages" in {
    val json = """
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [
              {
                "name": "empty-lang-repo",
                "languages": {
                  "edges": []
                },
                "defaultBranchRef": null
              }
            ]
          }
        }
      }
    }
    """

    val result = decode[GithubResponse](json)
    result.isRight shouldBe true
    result.toOption.get.data.viewer.repositories.nodes.head.languages.edges shouldBe empty
  }

  it should "fail on malformed JSON" in {
    val json = """{"data": {"viewer": {}}}"""
    val result = decode[GithubResponse](json)
    result.isLeft shouldBe true
  }

  it should "fail on missing required fields" in {
    val json = """{"data": {"viewer": {"repositories": {"nodes": [{"name": "r"}]}}}}"""
    val result = decode[GithubResponse](json)
    result.isLeft shouldBe true
  }

  it should "decode a response with commit data" in {
    val json = """
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [
              {
                "name": "active-repo",
                "languages": {
                  "edges": [
                    {"size": 100, "node": {"name": "Scala"}}
                  ]
                },
                "defaultBranchRef": {
                  "target": {
                    "history": {
                      "edges": [
                        {"node": {"committedDate": "2024-01-15T10:30:00Z", "message": "Initial commit"}},
                        {"node": {"committedDate": "2024-01-16T14:00:00Z", "message": "Add feature"}}
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
    """

    val result = decode[GithubResponse](json)
    result.isRight shouldBe true

    val response = result.toOption.get
    val repo = response.data.viewer.repositories.nodes.head
    repo.name shouldBe "active-repo"

    val branchRef = repo.defaultBranchRef
    branchRef shouldBe defined
    branchRef.get.target shouldBe defined

    val history = branchRef.get.target.get.history
    history.edges should have length 2
    history.edges.head.node.committedDate shouldBe "2024-01-15T10:30:00Z"
    history.edges.head.node.message shouldBe "Initial commit"
    history.edges(1).node.message shouldBe "Add feature"
  }

  it should "handle repo with no default branch" in {
    val json = """
    {
      "data": {
        "viewer": {
          "repositories": {
            "nodes": [
              {
                "name": "no-branch-repo",
                "languages": {
                  "edges": []
                },
                "defaultBranchRef": null
              }
            ]
          }
        }
      }
    }
    """

    val result = decode[GithubResponse](json)
    result.isRight shouldBe true
    result.toOption.get.data.viewer.repositories.nodes.head.defaultBranchRef shouldBe None
  }

  it should "decode CommitNode" in {
    val json = """{"committedDate": "2024-06-15T08:00:00Z", "message": "Fix bug #42"}"""
    val result = decode[CommitNode](json)
    result.isRight shouldBe true
    result.toOption.get.committedDate shouldBe "2024-06-15T08:00:00Z"
    result.toOption.get.message shouldBe "Fix bug #42"
  }
}
