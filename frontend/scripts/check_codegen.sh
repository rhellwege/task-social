#!/bin/bash
set -e
set -x
echo "Checking http client code generation..."
pwd
cp services/api/Api.ts services/Api.ts.bak
sh ./scripts/generate_api.sh
# Check if new docs differs from docs.bak
if [ -n "$(diff services/Api.ts.bak services/api/Api.ts 2>&1)" ]
then
    echo "::error title=http-client-gen::Http client code needs to be generated. Run `npm run generate-api` or ./frontend/scripts/generate_api.sh."
    rm services/Api.ts.bak
    exit 1
fi
echo "Http client is up to date."
rm services/Api.ts.bak
