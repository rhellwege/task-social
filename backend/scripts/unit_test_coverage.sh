#!/bin/sh
mkdir -p coverage
go test -coverprofile=coverage/unit_coverage.out ./...
go tool cover -html=coverage/unit_coverage.out -o coverage/unit_coverage.html
# go tool cover -func=unit_coverage.out
