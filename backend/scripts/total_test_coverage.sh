#!/bin/sh
mkdir -p coverage
go test -cover -coverpkg=./... -coverprofile="coverage/integration_coverage.out" ./...
go tool cover -html=coverage/integration_coverage.out -o coverage/integration_coverage.html
# go tool cover -func=integration_coverage.out
