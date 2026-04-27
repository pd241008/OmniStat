package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"code-telemetry-engine/backend/internal/gateway"
	_ "github.com/lib/pq"
)

type Metric struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value float64 `json:"value"`
}

func main() {
	// Database connection (placeholder for now)
	// db, err := sql.Open("postgres", "postgres://user:pass@localhost/db?sslmode=disable")
	// if err != nil { log.Fatal(err) }

	mux := http.NewServeMux()

	// 1. Generic metrics route
	mux.HandleFunc("/api/v1/metrics/generic", corsMiddleware(handleGenericMetrics))

	// 2. Deep-dive proxy route (points to Scala service on port 9000)
	scalaServiceURL := "http://localhost:9000"
	mux.HandleFunc("/api/v1/metrics/deep-dive", corsMiddleware(gateway.SetupProxy(scalaServiceURL)))

	log.Println("[SERVER] API Gateway starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleGenericMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Mock data for now since DB isn't set up yet
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
