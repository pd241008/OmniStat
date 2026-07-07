.PHONY: help run-forge run-gateway run-frontend run-all dev test test-go test-scala test-frontend

# Default target
help:
	@echo "OmniStat Makefile"
	@echo "-----------------"
	@echo "Available commands:"
	@echo "  make run-forge      - Start The Forge (Data Ingestion - Scala)"
	@echo "  make run-gateway    - Start The Gateway (API Proxy - Go)"
	@echo "  make run-agent      - Start The Agent (System Polling - Go)"
	@echo "  make run-frontend   - Start The Terminal (Visualization - Next.js)"
	@echo "  make run-all        - Start all services concurrently"
	@echo "  make dev            - Alias for run-all"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run all tests across all layers"
	@echo "  make test-go        - Run Go backend tests"
	@echo "  make test-scala     - Run Scala ingestion tests"
	@echo "  make test-frontend  - Run frontend Vitest tests"

# The Forge (Data Ingestion)
run-forge:
	cd data && sbt run

# The Gateway (API Proxy)
run-gateway:
	cd backend && go run cmd/api/main.go

# The Agent (System Polling)
run-agent:
	cd backend && go run cmd/agent/main.go

# The Terminal (Visualization)
run-frontend:
	cd frontend && npm run dev

# Run all services concurrently
run-all:
	@echo "Starting all OmniStat services..."
	make run-forge & \
	make run-gateway & \
	make run-agent & \
	make run-frontend & \
	wait

dev: run-all

# Testing
test: test-go test-scala test-frontend

test-go:
	cd backend && go test ./... -v

test-scala:
	cd data && sbt test

test-frontend:
	cd frontend && npm test
