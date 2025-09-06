SQLC_DEPS := $(wildcard internal/db/sql/schemas/*.sql) $(wildcard internal/db/sql/queries/*.sql) $(wildcard sqlc.yaml)
SWAGGER_DEPS := $(wildcard internal/api/handlers/*.go) $(wildcard cmd/*)

sqlc: $(SQLC_DEPS)
	cd internal/db/ && sqlc generate

swagger: $(SWAGGER_DEPS)
	swag fmt
	swag init -g cmd/main.go

check:
	go vet ./...
	nilaway ./...

format: $(wildcard ./.../*.go)
	go fmt ./...

build: sqlc swagger format
	go build -o bin/main cmd/main.go
