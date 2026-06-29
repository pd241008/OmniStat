package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"code-telemetry-engine/backend/internal/database"
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
	mux.HandleFunc("/api/v1/metrics/velocity", middleware.CorsMiddleware(handlers.HandleVelocityMetrics))
	mux.HandleFunc("/api/v1/metrics/activity", middleware.CorsMiddleware(handlers.HandleActivityMetrics))

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Println("[SERVER] API Gateway starting on :8080...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	<-quit
	log.Println("[SERVER] Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced shutdown: %v", err)
	}

	log.Println("[SERVER] Server exited")
}
