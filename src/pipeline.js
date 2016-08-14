// HELPERS
function uniqueID() {
  return Object.freeze({});
}

// PIPE
let pipe = module.exports = function pipe(callback=null, _pipes={cbs:[]}){
  callback && _pipes.cbs.push(callback);
  return {
    pipe: cb => pipe(cb, _pipes),
    run: res => {
      let cb, i=0;
      while(cb = _pipes.cbs[i++]){
        let temp = cb(res);
        if(temp && temp.pipe) temp.pipe(_ => temp = _).run();
        if(temp === pipe.skip) continue;
        res = temp;
        if(res === pipe.stop) break;
      }
      return res;
    }
  };
}

// COMMANDS
pipe.stop = uniqueID();
pipe.skip = uniqueID();

// EXTRA FUNCTIONALITY
pipe.pipeline = function(callback) {
  let _pipe = pipe();
  callback(_pipe.run);
  return _pipe;
};

// HELPERS
pipe.preciseBuffer = function(exactly=0) {
  let buffer = [];
  return _ => {
    buffer.push(_);
    if(buffer.length < exactly) return pipe.stop;
    return buffer.splice(0);
  };
};
pipe.continuousBuffer = function(upperBoundLimit=100) {
  let buffer = [];
  return _ => {
    buffer.push(_);
    if(buffer.length > upperBoundLimit) buffer.splice(0,buffer.length - upperBoundLimit);
    return buffer;
  };
};
pipe.latest = function(n) {
  return _ => {
    return _.slice(-n);
  };
};
pipe.log = function(msg, process = _ => _) {
  return _ => {
    let log = [process(_)];
    msg && log.unshift(msg);
    return console.log.apply(console, log);
  };
};
