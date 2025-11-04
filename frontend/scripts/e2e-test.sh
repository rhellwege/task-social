#!/bin/sh
set -e
set -x

npx expo prebuild --platform ios
npm start &
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
