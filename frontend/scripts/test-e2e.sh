#!/bin/sh

npm start &
detox test --configuration ios.sim.debug
