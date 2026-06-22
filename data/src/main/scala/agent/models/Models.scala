package agent.models

// GraphQL Response Models
case class LanguageNode(name: String)
case class LanguageEdge(size: Int, node: LanguageNode)
case class Languages(edges: List[LanguageEdge])
case class Repository(name: String, languages: Languages)
case class User(repositories: RepositoryConnection)
case class RepositoryConnection(nodes: List[Repository])
case class GithubData(viewer: User)
case class GithubResponse(data: GithubData)
