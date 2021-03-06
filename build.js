var fs = require('fs');
var exec = require('child_process').exec;
var execSync = require('./build/sequentialExecution.js');

execSync()

// SETUP BUILD ENVIRONMENT
// ---------------------------------------

.next("rm -rf temp")
.next("rm -rf dist")
.next("mkdir temp")
.next("mkdir dist")

// BUILD PIPELINE.MODULE.MIN.JS
// ---------------------------------------

.next("./node_modules/browserify/bin/cmd.js ./src/pipeline.js -o ./temp/pipeline.js -t [ babelify --presets [ es2015 ] ]", function(resolve, reject) {
  fs.readFile('temp/pipeline.js', 'utf8', function(err, data) {  
    if(err) return reject();
    var module = data.trim().match(/\[([0-9]*)\]\)\;$/)[1];
    exec('echo "var f = $(cat temp/pipeline.js) module.exports = f('+module+');" > ./temp/pipeline.module.js', resolve);
  });
})
.next("./node_modules/.bin/uglifyjs --compress --screw-ie-8 --comments --mangle --mangle-props --mangle-regex='/^_/' ./temp/pipeline.module.js -o ./dist/pipeline.module.js")

// BUILD STAND ALONE VERSION
// ---------------------------------------

.next("./node_modules/browserify/bin/cmd.js ./src/pipeline.js --standalone pipeline -o ./dist/pipeline.js -t [ babelify --presets [ es2015 ] ]")
.next("./node_modules/.bin/uglifyjs --compress --screw-ie-8 --comments --mangle --mangle-props --mangle-regex='/^_/' ./dist/pipeline.js -o ./dist/pipeline.min.js")

// REMOVE TEMPORARY FILES
// ---------------------------------------

.next("rm -rf temp");
