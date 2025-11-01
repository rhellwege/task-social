#!/bin/bash
set -e
set -x
mkdir -p ./services/api
npx swagger-typescript-api generate --path ../backend/docs/swagger.json -o ./services/api -n Api.ts --clean-output
