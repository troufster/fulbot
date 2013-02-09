var Listener = require('../listeners').Listener;
var Emitter = require('events').EventEmitter;
var util = require('util');

var log = [];


function BotMock() {
  this.ev = {
    "message" : []
  };
  this.addListener = function(msg, cb) {
    this.ev[msg].push(cb);
  }

  this.emit = function(type, a1, a2, a3, a4) {
    var evs = this.ev[type];

    for(var i = 0, l = evs.length; i <l; i++) {
      evs[i](a1, a2, a3, a4);
    }
  }
}


exports.instance = function(test){
  var e = new BotMock();
  var l = new Listener(e);

  test.ok(l != null, "should pass");
  test.done();
};

exports.execChanRoutes= function(test) {

  var b = new BotMock();
  var l = new Listener(b);

  l.routes = { "#somechan" : [], "priv" : []};

  //Inject a mocky route
  l.routes["#somechan"].push([/\!hello/i, function(bot, from, to, message) {
    test.ok(message == "!hello");
    test.ok(from == "Rolf");
    test.ok(to == "#somechan");
    test.done();
  }]);


  //Send a message along that route lolz
  l.checkListeners("Rolf", "#somechan", "!hello");
};

exports.execPrivRoutes= function(test) {

  var b = new BotMock();
  var l = new Listener(b);

  l.routes = { "#somechan" : [], "priv" : []};

  //Inject a mocky route
  l.routes["priv"].push([/\!hello/i, function(bot, from, to, message) {
    test.ok(message == "!hello");
    //priv should from/to!
    test.ok(from == "Smegma");
    test.ok(to == "Rolf");
    test.done();
  }]);


  //Send a message along that route lolz
  l.checkListeners("Rolf", "Smegma", "!hello");
};



