// Copyright (c) 2016 Pablo Garcia
// v0.5.0-beta
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
module && module.exports = (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = function uniqueID() {
  var obj = { __isUniqueID: true };
  return Object.freeze ? Object.freeze(obj) : obj;
};

},{}],2:[function(require,module,exports){
"use strict";

var uniqueID = require("./helpers/uniqueID.js");

/**
 * pipe function
 * @param  {Function} [callback=null] callback to be executed on run
 * @param  {Object}   _pipes          private object to store the callbacks
 * @return {pipe}
 */
var pipe = module.exports = function _pipe2() {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  var _pipes = arguments.length <= 1 || arguments[1] === undefined ? { cbs: [] } : arguments[1];

  callback && _pipes.cbs.push(callback);
  return {
    pipe: function pipe(cb) {
      return _pipe2(cb, _pipes);
    },
    run: function run(res) {
      var cb = void 0,
          i = 0;
      while (cb = _pipes.cbs[i++]) {
        var temp = cb(res);
        if (temp && temp.pipe) temp.pipe(function (_) {
          return temp = _;
        }).run();
        if (temp === _pipe2.commands.skip) continue;
        res = temp;
        if (res === _pipe2.commands.stop) break;
      }
      return res;
    }
  };
};

pipe.commands = {

  /**
   * stop command
   * when returned through a pipe, the pipeline stops
   * @type {object}
   */
  stop: uniqueID(),

  /**
   * stop command
   * when returned through a pipe, the pipeline skips
   * the result from the current pipe function.
   * @type {object}
   */
  skip: uniqueID()

};

/**
 * Wraps the execution of a pipe.
 * @param  {Function}         callback receives:
 *      @argument {Function}  run pipe runner
 * @return {pipe}
 */
pipe.pipeline = function () {
  var callback = arguments.length <= 0 || arguments[0] === undefined ? function (_) {} : arguments[0];

  var _pipe = pipe();
  callback(_pipe.run);
  return _pipe;
};

pipe.helpers = {
  /**
   * Buffers until numOfItems and restarts the buffer.
   * @param  {Number} [numOfItems=0] length of the buffer
   * @return {Function}
   */
  every: function every() {
    var numOfItems = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    var buffer = [];
    return function (_) {
      buffer.push(_);
      if (buffer.length < numOfItems) return pipe.commands.stop;
      return buffer.splice(0);
    };
  },

  /**
   * Keeps a continuous buffer with an upperLimit of items.
   * Every time the pipe is 'run', the full buffer will be
   * passed down the pipe.
   * @param  {Number} [upperBoundLimit=100] maximum number of items in the buffer at any given time
   * @return {Function}
   */
  buffer: function buffer() {
    var upperBoundLimit = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];

    var buffer = [];
    return function (_) {
      buffer.push(_);
      if (buffer.length > upperBoundLimit) buffer.splice(0, buffer.length - upperBoundLimit);
      return buffer.slice(0);
    };
  },

  /**
   * Used in conjuction with 'buffer', this static method
   * will return the latest numOfItems in the buffer.
   * @param  {Number} numOfItems number of items to select from the buffer
   * @return {Function}
   */
  latest: function latest(numOfItems) {
    return function (_) {
      return _.slice(-numOfItems);
    };
  },

  /**
   * This logger is just a helper to print to the console with ease.
   * @param  {String}   [msg]     message to log before values
   * @param  {Function} [process] callback to process data if needed
   * @return {Function}
   */
  log: function log() {
    var msg = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var process = arguments.length <= 1 || arguments[1] === undefined ? function (_) {
      return _;
    } : arguments[1];

    return function (_) {
      msg && console.log(msg);
      console.log(process(_));
      return pipe.commands.skip;
    };
  },

  /**
   * Allows execution of a function without taking into account it's result.
   * @param  {Function} fn
   * @return {Function}
   */
  execute: function execute() {
    var fn = arguments.length <= 0 || arguments[0] === undefined ? function (_) {} : arguments[0];

    return function () {
      fn.apply(undefined, arguments);
      return pipe.commands.skip;
    };
  }
};

},{"./helpers/uniqueID.js":1}]},{},[2])(2);
