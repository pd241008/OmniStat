package agent.models

// GraphQL Response Models
case class LanguageNode(name: String)
case class LanguageEdge(size: Int, node: LanguageNode)
case class Languages(edges: List[LanguageEdge])
case class CommitNode(committedDate: String, message: String)
case class CommitEdge(node: CommitNode)
case class CommitHistory(edges: List[CommitEdge])
case class RefTarget(history: CommitHistory)
case class BranchRef(target: Option[RefTarget])
case class Repository(name: String, languages: Languages, defaultBranchRef: Option[BranchRef])
case class User(repositories: RepositoryConnection)
case class RepositoryConnection(nodes: List[Repository])
case class GithubData(viewer: User)
case class GithubResponse(data: GithubData)
