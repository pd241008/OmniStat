package main

import (
	"log"
	"net/http"

	"code-telemetry-engine/backend/internal/database"
	"code-telemetry-engine/backend/internal/gateway"
	"code-telemetry-engine/backend/internal/handlers"
	"code-telemetry-engine/backend/internal/middleware"
)

func main() {
	// Initialize database connection
	database.InitDB()

	mux := http.NewServeMux()

	// Register API Routes
	mux.HandleFunc("/api/v1/metrics/generic", middleware.CorsMiddleware(handlers.HandleGenericMetrics))
	mux.HandleFunc("/api/v1/metrics/languages", middleware.CorsMiddleware(handlers.HandleLanguageMetrics))
	
	// TODO: Phase 4 - Create /api/v1/metrics/velocity endpoint.
	// This should query ClickHouse for temporal heatmapping (commits grouped by hour/day)
	// and serve a dense array to the Next.js VelocityMatrix component.

	// TODO: Phase 4 - Create /api/v1/metrics/activity endpoint.
	// This should fetch a chronological stream of the latest events (commits, pushes)
	// from ClickHouse to power the TerminalFeed component.

	// Deep-dive proxy route to Scala backend
	scalaServiceURL := "http://localhost:9000"
	mux.HandleFunc("/api/v1/metrics/deep-dive", middleware.CorsMiddleware(gateway.SetupProxy(scalaServiceURL)))

	log.Println("[SERVER] API Gateway starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
