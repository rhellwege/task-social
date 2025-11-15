#!/bin/sh
# this script assumes the backend is already running on localhost:5050

set -e
set -x

npx expo prebuild --platform ios
detox build --configuration ios.sim.debug
