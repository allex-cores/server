var http = require('http'),
  execlib = null;
function functionRegistrator(func){
  return function(){
    return func;
  };
}
function createExecSuite(lib){
  'use strict';
  if(execlib){
    return execlib;
  }
  require('./libshimmer')(lib);
  execlib = {lib:lib};
  var Callable = require('allex_callableservercorelib')(lib),
    TalkerFactory = require('allex_transportservercorelib')(lib, require('@microsoft/signalr')),
    tmpPipeDir = require('allex_temppipedirserverruntimelib'),
    portSuite = require('allex_portofficeserverruntimelib')(lib);
  //require('./transport/http/sendrequestcreator')(TalkerFactory.prototype.HttpTalker);
  require('allex_clientcore')(execlib,TalkerFactory);
  execlib.execSuite.Callable = Callable;
  //require('./transport/portsniffer')(execlib);
  var SessionIntroductor = require('allex_sessionintroductorservercorelib')(lib);
  var servicepacklib = require('allex_servicepackservercorelib')(execlib, SessionIntroductor),
      signalrlib = require('allex_signalrservercorelib')(execlib),
      Server = require('allex_serverservercorelib')(execlib, signalrlib, SessionIntroductor)
      ;

  execlib.execSuite.userSessionFactoryCreator = servicepacklib.userSessionFactoryCreator;
  execlib.execSuite.RemoteServiceListenerServiceMixin = servicepacklib.RemoteServiceListenerServiceMixin;
  execlib.execSuite.registry.add('.',servicepacklib.base);
  execlib.execSuite.registry.add('.authentication',servicepacklib.authentication);
  execlib.execSuite.installFromError = require('allex_npminstallserverruntimelib')(lib);
  execlib.execSuite.firstFreePortStartingWith = portSuite.reserve;
  execlib.execSuite.checkPort = portSuite.check;
  execlib.execSuite.tmpPipeDir = tmpPipeDir;
  var __initialized = false;
  execlib.execSuite.acquireAuthSink = Server.acquireAuthSink;
  execlib.execSuite.start = function(serverdescriptor){
    var _intact = !__initialized;
    __initialized = true;
    if(_intact){
      if(process.send){
        serverdescriptor.ports = serverdescriptor.ports || [];
        serverdescriptor.ports.push({
          protocol:{
            name:'parent_proc'
          }
        });
      }
    }
    return Server.start.apply(Server,arguments);
  };
  execlib.execSuite.lanManagerPorts = [{
    protocol:{
      name: 'http'
    },
    port: 22451
  },{
    protocol:{
      name: 'ws'
    },
    port: 23451
  },{
    protocol:{
      name: 'socket'
    },
    port: 23551
  }];
  execlib.execSuite.machineManagerPorts = [{
    protocol:{
      name: 'socket'
    },
    port: require('path').join(tmpPipeDir(),'allexmachinemanager')
  }];
  execlib.execSuite.tcpTransmissionStartingPort = 24000;

  return execlib;
};


module.exports = createExecSuite;
