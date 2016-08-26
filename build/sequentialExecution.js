var exec = require('child_process').exec;

function run(command, fn) {
  return new Promise(function(resolve, reject){
    exec(command, function(err, stdout, stderr){
      if(fn) {
        fn(resolve, reject);
      } else {
        if(!err) resolve();
        else {
          console.log(stderr);
          reject();
        }
      }
    });
  });
}

// makes execution synchronous
function execSync(){
  var cbs = []
  var ret;
  var timeoutId;

  function go(index) {
    index = index || 0;
    cbs[index] && run(cbs[index].cmd, cbs[index].fn).then(function(){
      go(++index);
    });
  }

  return ret = {
    next: function(cmd, fn){
      clearTimeout(timeoutId);

      cbs.push({
        cmd: cmd,
        fn: fn
      });

      timeoutId = setTimeout(go);
      return ret;
    }
  };
}

module.exports = execSync;