#!/bin/sh
set -e
set -x

brew install node
npm install detox-cli --global

brew tap wix/brew
brew install applesimutils
