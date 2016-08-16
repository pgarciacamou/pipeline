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

describe('pipeline functional tests', function() {
  let later = fn => {
    window.setTimeout(fn, 1);
  };

  var _pipeline;
  var pipeSpy;
  beforeEach(function() {
    pipeSpy = jasmine.createSpy("pipeSpy");
    _pipeline = pipe().pipe(_ => (pipeSpy(), _));
    _pipeline.run();
  });
  it('should run the pipe', function() {
    expect(pipeSpy).toHaveBeenCalled();
  });
  it('should run the pipe asynchronously', function(done) {
    let test = "test";
    pipeline(run => {
      later(_ => run(test));
    }).pipe(res => {
      expect(res).toEqual(test);
      done();
    });
  });
  it('allows to add to a pipe even after creation/execution', function() {
    let test = "test";
    _pipeline.pipe(_ => test).pipe(res => {
      expect(res).toEqual(test);
    }).run();
  });
  it('allows to run synchronously', function() {
    let test = "test";
    expect(pipe(_ => test).run()).toEqual(test);
  });
  it('should pipe the results', function() {
    let test = "test";
    let temp = "temp";
    _pipeline
    .pipe(_ => test)
    .pipe(_ => _ + temp)
    .pipe(_ => {
      expect(_).toEqual(test + temp);
    })
    .run();
  });
  it('should run as many times as needed', function() {
    _pipeline.run();
    expect(pipeSpy).toHaveBeenCalledTimes(2);
  });
  it('allows returning pipes within a pipeline', function() {
    let test = "test";
    pipe(_ => {
      return pipe(_ => test);
    })
    .pipe(_ => {
      expect(_).toEqual(test);
    })
    .run();
  });

  describe('pipeline commands', function() {
    let tempSpy;
    let tempSpy2;
    let test;
    beforeEach(function() {
      tempSpy = jasmine.createSpy("tempSpy");
      tempSpy2 = jasmine.createSpy("tempSpy2");
      test = "test";

      _pipeline
      .pipe(_ => test)
      .pipe(_ => skip)
      .pipe(tempSpy2)
      .pipe(_ => stop)
      .pipe(tempSpy)
      .run();
    });
    it('allows to stop', function() {
      expect(tempSpy).not.toHaveBeenCalled();
    });
    it('allows to skip', function() {
      expect(tempSpy2).not.toHaveBeenCalledWith(undefined);
    });
  });

  describe('pipeline helpers', function() {
    it('should be an exact number of elements using "every" method', function(done) {
      let count = 5;
      let times = 3;
      pipeline(run => {
        let counter = 1;
        later(function loop(){
          run(counter++);
          if(counter <= count * times) {
            later(loop);
          } else {
            done();
          }
        });
      })
      .pipe(every(count))
      .pipe(res => {
        expect(res.length).toEqual(count);
      });
    });
    it('should buffer with a limit', function(done) {
      let count = 5;
      let times = 3;
      pipeline(run => {
        let counter = 1;
        later(function loop(){
          run(counter++);
          if(counter <= count * times) {
            later(loop);
          } else {
            done();
          }
        });
      })
      .pipe(buffer(count))
      .pipe(res => {
        expect(res.length <= count).toBeTruthy();
      });
    });
    it('should return the latest number of items in the buffer', function(done) {
      let count = 5;
      let times = 3;
      pipeline(run => {
        let counter = 1;
        later(function loop(){
          run(counter++);
          if(counter <= count * times) {
            later(loop);
          } else {
            done();
          }
        });
      })
      .pipe(buffer())
      .pipe(latest(count))
      .pipe(res => {
        expect(res.length <= count).toBeTruthy();
      });
    });
    it('should run the log method in window.console', function() {
      spyOn(console, "log");
      let test = "test";
      pipe(_ => test)
      .pipe(log(test))
      .pipe(_ => {
        expect(console.log).toHaveBeenCalledWith(test, test);
      })
      .run();
    });
  });
  
  describe('events', function() {
    function dispatchEvent(element, eventName, eventData) {
      var ev = document.createEvent("Event");
      ev.data = eventData;
      ev.initEvent(eventName, true, true);
      element.dispatchEvent(ev);
    }

    function fireEventsAsync(element, eventName, times) {
      for(let i = 0; i < times; i++) {
        setTimeout(_ => {
          dispatchEvent(element, eventName);
        }, Math.floor(Math.random() * 20));
      }
    }

    var elem;
    var _pipeline;
    var numOfEvents;
    var eventName;
    beforeEach(function() {
      numOfEvents = 10;
      eventName = "testing";
      elem = document.createElement("div");

      _pipeline = pipeline(function (run) {
        elem.addEventListener(eventName, run, false);
      })
      .pipe(every(numOfEvents));
    });
    it('should buffer without problems', function(done) {
      _pipeline
      .pipe(execute(evts => expect(evts.length).toEqual(numOfEvents)))
      .pipe(done);
      fireEventsAsync(elem, eventName, numOfEvents);
    });
    it('can be used to compute data', function(done) {
      _pipeline
      .pipe(evts => {
        return evts.reduce((a,b) => {
          return b.timeStamp + (a.timeStamp ? a.timeStamp : a);
        }) / evts.length;
      })
      .pipe(avgTimestamp => expect(isNaN(avgTimestamp)).not.toBeTruthy())
      .pipe(done);
      fireEventsAsync(elem, eventName, numOfEvents);
    });
  });

  describe('multiple paths', function() {
    var pipe1;
    var pipe2;
    var commonPipe;
    beforeEach(function() {
      function init(){
        return 0;
      }
      function add1(res) {
        return res + 1;
      }
      function add2(res) {
        return res + 2;
      }
      commonPipe = pipe(init)
      pipe1 = commonPipe.pipe(add1)
      pipe2 = commonPipe.pipe(add2)
    });
    it('should not allow multiple paths on pipes', function() {
      // This is not the correct way to split pipes, 
      // as the callbacks are cached in a shared object.
      // Unless a callback hasn't been added, it will be run.
      pipe1
      .pipe(execute(_ => expect(_).not.toEqual(1)))
      .pipe()
      .run();

      pipe2
      .pipe(execute(_ => expect(_).not.toEqual(2)))
      .pipe(execute(_ => expect(_).toEqual(3)))
      .run();

      commonPipe
      .pipe(execute(_ => expect(_).toEqual(3)))
      .run();
    });
    it('should allow multiple paths', function() {
      // This is the correct way to split pipes.
      commonPipe

      // returning a pipe allows to continue on different pipes.
      .pipe(_ => pipe(_ => -1))

      // return skip so it doesn't modify the current stream.
      .pipe(execute(_ => expect(_).not.toEqual(3)))
      .pipe(_ => expect(_).toEqual(-1))
      .run();
    });
  });
});