const pipe = require("../../src/pipeline.js");
const {
  stop,
  skip,
  pipeline,
  every,
  buffer,
  latest,
  log
} = pipe;

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

describe('pipeline functional tests', function() {
  describe('events', function() {
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
      .pipe(evts => expect(evts.length).toEqual(numOfEvents))
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
});