#!/bin/bash

rm -rf temp
rm -rf dist
mkdir temp
mkdir dist

MODULE=${MODULE:=2}

# Build pipeline.module.min.js
./node_modules/browserify/bin/cmd.js ./src/pipeline.js -o ./temp/pipeline.js -t [ babelify --presets [ es2015 ] ]
echo "var f = $(cat temp/pipeline.js) module.exports = f($MODULE);" > ./temp/pipeline.module.js
node_modules/.bin/uglifyjs --compress --screw-ie-8 --comments --mangle --mangle-props --mangle-regex='/^_/' ./temp/pipeline.module.js -o ./dist/pipeline.module.js

#Build stand alone version
./node_modules/browserify/bin/cmd.js ./src/pipeline.js --standalone pipeline -o ./dist/pipeline.js -t [ babelify --presets [ es2015 ] ]
./node_modules/.bin/uglifyjs --compress --screw-ie-8 --comments --mangle --mangle-props --mangle-regex='/^_/' ./dist/pipeline.js -o ./dist/pipeline.min.js

rm -rf temp