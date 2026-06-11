.PHONY: help run-forge run-gateway run-frontend run-all dev

# Default target
help:
	@echo "OmniStat Makefile"
	@echo "-----------------"
	@echo "Available commands:"
	@echo "  make run-forge      - Start The Forge (Data Ingestion - Scala)"
	@echo "  make run-gateway    - Start The Gateway (API Proxy - Go)"
	@echo "  make run-frontend   - Start The Terminal (Visualization - Next.js)"
	@echo "  make run-all        - Start all services concurrently"
	@echo "  make dev            - Alias for run-all"

# The Forge (Data Ingestion)
run-forge:
	cd data && sbt run

# The Gateway (API Proxy)
run-gateway:
	cd backend && go run cmd/api/main.go

# The Terminal (Visualization)
run-frontend:
	cd frontend && npm run dev

# Run all services concurrently
run-all:
	@echo "Starting all OmniStat services..."
	make run-forge & \
	make run-gateway & \
	make run-frontend & \
	wait

dev: run-all
