# Makefile for Bolos Ya Project
.PHONY: help build test lint run generate docker-build docker-up docker-down migrate-up migrate-down clean deps

# Variables
BINARY_NAME=bolos-ya-server
BUILD_DIR=bin
GO=go
GOFLAGS=-v
MODULE_NAME=github.com/edorguez/bolos-ya

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

## Help: Display available targets
help:
	@echo "Available targets:"
	@echo "  ${GREEN}build${NC}         - Build the backend binary"
	@echo "  ${GREEN}test${NC}          - Run all tests"
	@echo "  ${GREEN}test-race${NC}     - Run tests with race detector"
	@echo "  ${GREEN}lint${NC}          - Run golangci-lint"
	@echo "  ${GREEN}run${NC}           - Run the backend server"
	@echo "  ${GREEN}generate${NC}      - Generate code from OpenAPI spec"
	@echo "  ${GREEN}deps${NC}          - Install dependencies"
	@echo "  ${GREEN}docker-build${NC}  - Build Docker image for the server"
	@echo "  ${GREEN}docker-up${NC}     - Start all development services (PostgreSQL, Redis, MinIO, Server) using .env.docker"
	@echo "  ${GREEN}docker-down${NC}   - Stop development services"
	@echo "  ${GREEN}migrate-up${NC}    - Run database migrations"
	@echo "  ${GREEN}migrate-down${NC}  - Rollback database migrations"
	@echo "  ${GREEN}clean${NC}         - Clean build artifacts"
	@echo "  ${GREEN}swagger${NC}       - Generate Swagger/OpenAPI documentation"
	@echo "  ${GREEN}coverage${NC}      - Generate test coverage report"

## Build: Build the backend binary
build:
	@echo "${YELLOW}Building $(BINARY_NAME)...${NC}"
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server

## Test: Run all tests
test:
	@echo "${YELLOW}Running tests...${NC}"
	$(GO) test -v ./...

## Test with race detector
test-race:
	@echo "${YELLOW}Running tests with race detector...${NC}"
	$(GO) test -v -race ./...

## Lint: Run golangci-lint
lint:
	@echo "${YELLOW}Running linter...${NC}"
	golangci-lint run ./...

## Run: Run the backend server
run:
	@echo "${YELLOW}Starting server...${NC}"
	$(GO) run ./cmd/server

## Generate: Generate code from OpenAPI spec
generate:
	@echo "${YELLOW}Generating Go server stubs from OpenAPI spec...${NC}"
	@if ! command -v oapi-codegen >/dev/null 2>&1; then \
		echo "Installing oapi-codegen..."; \
		go install github.com/deepmap/oapi-codegen/v2/cmd/oapi-codegen@latest; \
	fi
	oapi-codegen -generate types,server -package api docs/openapi.yaml > internal/api/rest/generated.go
	@echo "${YELLOW}Generating TypeScript client...${NC}"
	@if ! command -v openapi-typescript-codegen >/dev/null 2>&1; then \
		echo "Installing openapi-typescript-codegen..."; \
		npm install -g openapi-typescript-codegen; \
	fi
	openapi-typescript-codegen --input docs/openapi.yaml --output gen/typescript --client axios

## Dependencies: Install Go dependencies
deps:
	@echo "${YELLOW}Installing dependencies...${NC}"
	$(GO) mod download
	$(GO) mod tidy
	@echo "${YELLOW}Installing tools...${NC}"
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/deepmap/oapi-codegen/v2/cmd/oapi-codegen@latest
	go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest

## Docker: Build server image
docker-build:
	@echo "${YELLOW}Building Docker image for server...${NC}"
	docker-compose build server

## Docker Compose: Start development services with .env.docker
docker-up:
	@echo "${YELLOW}Starting development services with .env.docker...${NC}"
	docker-compose --env-file .env.docker up -d

## Docker Compose: Stop development services
docker-down:
	@echo "${YELLOW}Stopping development services...${NC}"
	docker-compose --env-file .env.docker down

## Migrations: Run database migrations up
migrate-up:
	@echo "${YELLOW}Running database migrations...${NC}"
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/bolosya_dev?sslmode=disable" up

## Migrations: Rollback database migrations
migrate-down:
	@echo "${YELLOW}Rolling back database migrations...${NC}"
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/bolosya_dev?sslmode=disable" down

## Clean: Clean build artifacts
clean:
	@echo "${YELLOW}Cleaning build artifacts...${NC}"
	rm -rf $(BUILD_DIR)
	rm -f coverage.out
	find . -name "*.test" -delete

## Swagger: Generate Swagger/OpenAPI documentation
swagger:
	@echo "${YELLOW}Generating Swagger documentation...${NC}"
	@if ! command -v swag >/dev/null 2>&1; then \
		echo "Installing swag..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	swag init -g cmd/server/main.go -o docs/swagger

## Coverage: Generate test coverage report
coverage:
	@echo "${YELLOW}Generating test coverage report...${NC}"
	$(GO) test -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "${GREEN}Coverage report generated: coverage.html${NC}"

## Default target
default: help