#!/bin/bash
set -e

./node_modules/.bin/swagger-typescript-api generate --path ../backend/docs/swagger.json -o ./services/api -n Api.ts --clean-output
