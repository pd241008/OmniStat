package models

type Metric struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type LanguageMetric struct {
	Name  string  `json:"name"`
	Value float64 `json:"val"`
}
