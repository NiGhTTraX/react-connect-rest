#!/usr/bin/env bash

set -e

cd "$( dirname "${BASH_SOURCE[0]}" )"

# --silent so we don't get the npm err epilogue.
npm run test:node:coverage --silent
