const pipe = require("../../src/pipeline.js");
const {
  stop,
  skip,
  pipeline,
  preciseBuffer,
  continuousBuffer,
  latest,
  log
} = pipe;

let later = fn => {
  window.setTimeout(fn, 1);
};

describe('pipeline', function() {
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

  describe('pipeline helpers', function() {
    it('should be an exact number of elements in a preciseBuffer', function(done) {
      let count = 5;
      let times = 3;
      pipeline(run => {
        let counter = 1;
        later(function loop(){
          run(counter++)
          if(counter <= count * times) {
            later(loop);
          } else {
            done();
          }
        })
      })
      .pipe(preciseBuffer(count))
      .pipe(res => {
        expect(res.length).toEqual(count);
      })
    });
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
});