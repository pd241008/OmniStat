export interface Metric {
  id: number;
  name: string;
  value: number;
}

export interface LanguageMetric {
  name: string;
  val: number;
}

export interface VelocityEntry {
  hour: number;
  day: number;
  commits: number;
}

export interface ActivityEntry {
  repo_name: string;
  committed_at: string;
  message: string;
}
