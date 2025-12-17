#!/bin/bash
set -e
cd internal/db
pwd
echo "Checking sqlc..."
if [ -n "$(sqlc diff 2>&1)" ]
then
    echo "::error title=sqlc-gen::Sqlc needs to be generated before pushing changes. Run sqlc generate in internal/db/sql or use the Makefile."
    exit 1
fi
echo "Sqlc is up to date."

echo "Checking swagger..."
cd ../../
pwd
cp -r docs docs.bak
swag init -g cmd/main.go
# Check if new docs differs from docs.bak
if [ -n "$(diff -r docs docs.bak 2>&1)" ]
then
    echo "::error title=swagger-gen::Docs need to be generated before pushing changes. Run swag init -g cmd/main.go in backend/ or use the Makefile."
    rm -rf docs.bak
    exit 1
fi
echo "Docs are up to date."
rm -rf docs.bak
