var Listener = require('../listeners').Listener;
var Emitter = require('events').EventEmitter;


exports.instanciate = function(test){
  var e = new Emitter();
  var l = new Listener(e);

  test.ok(l != null, "should pass");
  test.done();
};