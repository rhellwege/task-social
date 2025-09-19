#!/bin/sh
set -e
set -x
go install github.com/swaggo/swag/cmd/swag@latest
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go install github.com/air-verse/air@latest
go install go.uber.org/nilaway/cmd/nilaway@latest
go install go.uber.org/mock/mockgen@latest
