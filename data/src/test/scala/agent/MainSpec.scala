package agent

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import agent.models._

class MainSpec extends AnyFlatSpec with Matchers {

  "aggregateLanguages" should "sum byte counts across repos for each language" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("repo1", Languages(List(
                LanguageEdge(5000, LanguageNode("Scala")),
                LanguageEdge(3000, LanguageNode("Go"))
              )), defaultBranchRef = None),
              Repository("repo2", Languages(List(
                LanguageEdge(2000, LanguageNode("Scala")),
                LanguageEdge(1000, LanguageNode("Python"))
              )), defaultBranchRef = None)
            )
          )
        )
      )
    )

    val result = Main.aggregateLanguages(response)
    result shouldBe Map("Scala" -> 7000L, "Go" -> 3000L, "Python" -> 1000L)
  }

  it should "return empty map for no repos" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(nodes = List.empty)
        )
      )
    )

    val result = Main.aggregateLanguages(response)
    result shouldBe empty
  }

  it should "return empty map for repos with no languages" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("empty-repo", Languages(List.empty), defaultBranchRef = None)
            )
          )
        )
      )
    )

    val result = Main.aggregateLanguages(response)
    result shouldBe empty
  }

  it should "handle a single repo with a single language" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("mono-repo", Languages(List(
                LanguageEdge(10000, LanguageNode("Go"))
              )), defaultBranchRef = None)
            )
          )
        )
      )
    )

    val result = Main.aggregateLanguages(response)
    result shouldBe Map("Go" -> 10000L)
  }

  it should "handle zero byte languages" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("zero-lang", Languages(List(
                LanguageEdge(0, LanguageNode("Ruby"))
              )), defaultBranchRef = None)
            )
          )
        )
      )
    )

    val result = Main.aggregateLanguages(response)
    result shouldBe Map("Ruby" -> 0L)
  }

  "aggregateCommits" should "extract commits from repos with default branches" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("repo-a", Languages(Nil), defaultBranchRef = Some(BranchRef(
                target = Some(RefTarget(history = CommitHistory(List(
                  CommitEdge(CommitNode("2024-01-15T10:30:00Z", "First commit")),
                  CommitEdge(CommitNode("2024-01-16T14:00:00Z", "Second commit"))
                ))))
              ))),
              Repository("repo-b", Languages(Nil), defaultBranchRef = Some(BranchRef(
                target = Some(RefTarget(history = CommitHistory(List(
                  CommitEdge(CommitNode("2024-02-01T08:00:00Z", "Another commit"))
                ))))
              )))
            )
          )
        )
      )
    )

    val result = Main.aggregateCommits(response)
    result should have length 3
    result.head shouldBe ("repo-a", "2024-01-15T10:30:00Z", "First commit")
    result(1) shouldBe ("repo-a", "2024-01-16T14:00:00Z", "Second commit")
    result(2) shouldBe ("repo-b", "2024-02-01T08:00:00Z", "Another commit")
  }

  it should "return empty for repos with no default branch" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("no-branch", Languages(Nil), defaultBranchRef = None)
            )
          )
        )
      )
    )

    val result = Main.aggregateCommits(response)
    result shouldBe empty
  }

  it should "return empty for repos with default branch but no target" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("null-target", Languages(Nil), defaultBranchRef = Some(BranchRef(target = None)))
            )
          )
        )
      )
    )

    val result = Main.aggregateCommits(response)
    result shouldBe empty
  }

  it should "return empty for empty commit histories" in {
    val response = GithubResponse(
      GithubData(
        User(
          RepositoryConnection(
            nodes = List(
              Repository("empty-history", Languages(Nil), defaultBranchRef = Some(BranchRef(
                target = Some(RefTarget(history = CommitHistory(Nil)))
              )))
            )
          )
        )
      )
    )

    val result = Main.aggregateCommits(response)
    result shouldBe empty
  }
}
