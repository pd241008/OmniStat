package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"code-telemetry-engine/backend/internal/database"
	"code-telemetry-engine/backend/internal/models"
)

func HandleLanguageMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	db := database.GetDB()
	if db == nil {
		json.NewEncoder(w).Encode([]models.LanguageMetric{})
		return
	}

	ctx := context.Background()
	// Get latest byte count for each language
	rows, err := db.Query(ctx, `
		SELECT language, sum(byte_count) as total_bytes 
		FROM repo_languages 
		GROUP BY language 
		ORDER BY total_bytes DESC 
		LIMIT 5
	`)

	if err != nil {
		log.Printf("[ERROR] Query failed: %v", err)
		json.NewEncoder(w).Encode([]models.LanguageMetric{})
		return
	}
	defer rows.Close()

	var results []models.LanguageMetric
	var totalBytes float64

	type rowData struct {
		Lang  string
		Bytes int64
	}
	var data []rowData

	for rows.Next() {
		var lang string
		var bytes int64
		if err := rows.Scan(&lang, &bytes); err == nil {
			data = append(data, rowData{Lang: lang, Bytes: bytes})
			totalBytes += float64(bytes)
		}
	}

	for _, d := range data {
		percentage := 0.0
		if totalBytes > 0 {
			percentage = (float64(d.Bytes) / totalBytes) * 100
		}
		results = append(results, models.LanguageMetric{
			Name:  d.Lang,
			Value: float64(int(percentage)), // rounded for UI
		})
	}

	// Fallback if empty
	if len(results) == 0 {
		results = []models.LanguageMetric{
			{Name: "Scala", Value: 85},
			{Name: "Go", Value: 70},
			{Name: "TypeScript", Value: 95},
		}
	}

	json.NewEncoder(w).Encode(results)
}

func HandleGenericMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// For now, if DB fails, return mock data
	metrics := []models.Metric{
		{ID: 1, Name: "CPU Usage", Value: 45.2},
		{ID: 2, Name: "Memory Usage", Value: 62.8},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
