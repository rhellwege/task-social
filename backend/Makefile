.DEFAULT_GOAL := build

BIN_DIR := bin

SQLC_DEPS := $(wildcard internal/db/sql/schemas/*.sql) $(wildcard internal/db/sql/queries/*.sql) $(wildcard sqlc.yaml)
SQLC_MARKER := .sqlc.marker

SWAGGER_DEPS := $(wildcard internal/api/handlers/*.go) $(wildcard cmd/*)
SWAGGER_MARKER := .swagger.marker

.PHONY:fmt run build check test clean

$(SWAGGER_MARKER): $(SWAGGER_DEPS)
	swag fmt
	swag init -g cmd/main.go
	@touch $@

$(SQLC_MARKER): $(SQLC_DEPS)
	cd internal/db/ && sqlc generate
	@touch $@

fmt:
	@go fmt ./...

sqlc: $(SQLC_MARKER) fmt
swagger: sqlc $(SWAGGER_MARKER)

check:
	go vet ./...
	nilaway ./...
	cd internal/db && sqlc vet

build: swagger
	@mkdir -p $(BIN_DIR)
	go build -o $(BIN_DIR)/main cmd/main.go

run: build
	$(BIN_DIR)/main

test: check
	go test -v ./...

clean:
	go clean
	rm -f $(SQLC_MARKER) $(SWAGGER_MARKER)
	rm -rf $(BIN_DIR)
