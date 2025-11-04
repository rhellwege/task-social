#!/bin/sh
npx expo prebuild --platform ios
detox test --configuration ios.sim.debug
