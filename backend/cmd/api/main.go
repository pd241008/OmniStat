package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"code-telemetry-engine/backend/internal/gateway"
	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Metric struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type LanguageMetric struct {
	Name  string  `json:"name"`
	Value float64 `json:"val"`
}

var db driver.Conn

func main() {
	var err error
	
	// Dynamic connection from ENV
	chHost := os.Getenv("CLICKHOUSE_HOST")
	if chHost == "" {
		chHost = "localhost:9000"
	}
	chUser := os.Getenv("CLICKHOUSE_USER")
	if chUser == "" {
		chUser = "default"
	}
	chPassword := os.Getenv("CLICKHOUSE_PASSWORD")
	
	db, err = clickhouse.Open(&clickhouse.Options{
		Addr: []string{chHost},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: chUser,
			Password: chPassword,
		},
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "OmniStat Gateway", Version: "1.0"},
			},
		},
	})

	if err != nil {
		log.Printf("[WARNING] ClickHouse connection failed: %v", err)
	} else if err := db.Ping(context.Background()); err != nil {
		log.Printf("[WARNING] ClickHouse ping failed: %v", err)
	} else {
		log.Println("[SYSTEM] Connected to ClickHouse successfully")
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/metrics/generic", corsMiddleware(handleGenericMetrics))
	mux.HandleFunc("/api/v1/metrics/languages", corsMiddleware(handleLanguageMetrics))

	// Deep-dive proxy route
	scalaServiceURL := "http://localhost:9000"
	mux.HandleFunc("/api/v1/metrics/deep-dive", corsMiddleware(gateway.SetupProxy(scalaServiceURL)))

	log.Println("[SERVER] API Gateway starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleLanguageMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if db == nil {
		json.NewEncoder(w).Encode([]LanguageMetric{})
		return
	}

	ctx := context.Background()
	// Get latest byte count for each language (assuming sum of distinct languages or latest insert)
	rows, err := db.Query(ctx, `
		SELECT language, sum(byte_count) as total_bytes 
		FROM repo_languages 
		GROUP BY language 
		ORDER BY total_bytes DESC 
		LIMIT 5
	`)
	
	if err != nil {
		log.Printf("[ERROR] Query failed: %v", err)
		json.NewEncoder(w).Encode([]LanguageMetric{})
		return
	}
	defer rows.Close()

	var results []LanguageMetric
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
			data = append(data, rowData{lang, bytes})
			totalBytes += float64(bytes)
		}
	}

	for _, d := range data {
		percentage := 0.0
		if totalBytes > 0 {
			percentage = (float64(d.Bytes) / totalBytes) * 100
		}
		results = append(results, LanguageMetric{
			Name:  d.Lang,
			Value: float64(int(percentage)), // rounded for UI
		})
	}

	// Fallback if empty
	if len(results) == 0 {
		results = []LanguageMetric{
			{Name: "Scala", Value: 85},
			{Name: "Go", Value: 70},
			{Name: "TypeScript", Value: 95},
		}
	}

	json.NewEncoder(w).Encode(results)
}

func handleGenericMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// For now, if DB fails, return mock data
	metrics := []Metric{
		{ID: 1, Name: "CPU Usage", Value: 45.2},
		{ID: 2, Name: "Memory Usage", Value: 62.8},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}
