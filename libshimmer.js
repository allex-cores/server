function shimLib (lib) {
  'use strict';

  var maclib = require('allex_macaddresslowlevellib')(lib.isFunction, lib.isArray);

  function onSignal (signal) {
    if (lib.isString(signal)) {
      lib.shouldClose.fire(new lib.Error(signal, 'Server stopped'));
      return;
    }
    lib.shouldClose.fire();
  }
  function onExit (error) {
    if (error) {
      lib.shouldClose.fire(error);
      return;
    }
    lib.shouldClose.fire();
  }
  process.on('SIGINT',onSignal);
  process.on('SIGTERM',onSignal);
  process.on('exit',onExit);

  function machineNow () {
    return Number(process.hrtime.bigint()/1_000_000n);
  }
  lib.now = machineNow;

  lib.getMac= maclib.getMac;
  lib.isMac= maclib.isMac;
  lib.pid = function () {
    return process.pid;
  };
  lib.exit = function (code) {
    return process.exit(code);
  }
}
module.exports = shimLib;