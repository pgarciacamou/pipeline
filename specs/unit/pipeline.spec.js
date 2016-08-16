const pipe = require("../../src/pipeline.js");
const pipeline = pipe.pipeline;
const {
  stop,
  skip
} = pipe.commands;
const {
  every,
  buffer,
  latest,
  log,
  execute
} = pipe.helpers;

describe('pipeline unit tests', function() {
  var _pipe;
  var _pipeline;
  beforeEach(function() {
    _pipe = pipe();
    _pipeline = pipeline();
  });
  it('should return a pipe', function() {
    expect(Object.keys(_pipe).length).toEqual(2);
    expect(_pipe.pipe).not.toBeUndefined();
    expect(_pipe.run).not.toBeUndefined();
  });
  it('should return the piped result', function() {
    var input = "test";
    var output = _pipe.run(input);
    expect(input).toEqual(output);
  });
  it('should be unique object', function() {
    expect(Object.keys(pipe.commands).length).toEqual(2);
    expect(skip.__isUniqueID).toBeTruthy();
    expect(stop.__isUniqueID).toBeTruthy();
  });
  it('should return a pipe', function() {
    expect(Object.keys(_pipeline).length).toEqual(2);
    expect(_pipeline.pipe).not.toBeUndefined();
    expect(_pipeline.run).not.toBeUndefined();
  });
  it('should receive the run method as argument', function() {
    var arg;
    var p = pipeline(_ => {
      arg = _;
    });
    p.run();
    expect(arg).toEqual(p.run);
  });
  it('must return a function', function() {
    expect(Object.keys(pipe.helpers).length).toEqual(5);
    expect(typeof every()).toEqual("function");
    expect(typeof buffer()).toEqual("function");
    expect(typeof latest()).toEqual("function");
    expect(typeof log()).toEqual("function");
    expect(typeof execute()).toEqual("function");
  });
  it('should return command to stop', function() {
    var e = every(2);
    expect(e()).toEqual(stop);
  });
  it('should not return command to stop', function() {
    var e = every();
    expect(e()).not.toEqual(stop);
  });
  it('should return a buffer', function() {
    var b = buffer();
    expect(b() instanceof Array).toBeTruthy();
  });
  it('should not go passed the limit', function() {
    var b = buffer(1);
    b();
    b();
    expect(b().length).toEqual(1);
  });
  it('should slice the pipe values', function() {
    var l = latest(1);
    var arr = [];
    spyOn(arr, "slice");
    l(arr);
    expect(arr.slice).toHaveBeenCalledWith(-1);
  });
  it('should log to console', function() {
    spyOn(console, "log");
    var l = log();
    l();
    expect(console.log).toHaveBeenCalled();
  });
  it('should skip', function() {
    spyOn(console, "log");
    var l = log();
    expect(l()).toEqual(skip);
  });
  it('should process the data', function() {
    spyOn(console, "log");
    var l = log("testing", _ => 1);
    l();
    expect(console.log).toHaveBeenCalledWith(1);
  });
  it('should execute a function', function() {
    var spy = jasmine.createSpy("spy");
    var e = execute(spy);
    e(1);
    expect(spy).toHaveBeenCalledWith(1);
  });
  it('should return skip', function() {
    var e = execute();
    expect(e()).toEqual(skip);
  });
});