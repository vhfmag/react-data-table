#!/bin/bash

# IMPORTANT
# ---------
# This is an auto generated file with React CDK.
# Do not modify this file.
# Use `.scripts/user/prepublish.sh instead`.

echo "=> Transpiling 'src' into ES5 ..."
echo ""
rm -rf ./dist
# NODE_ENV=production ./node_modules/.bin/babel --ignore tests,stories --plugins "transform-runtime" --copy-files ./src --out-dir ./dist
NODE_ENV=production tsc && ./node_modules/.bin/rollup -c && cp ./src/index.scss ./dist/index.scss
echo ""
echo "=> Transpiling completed."

. .scripts/user/prepublish.sh
