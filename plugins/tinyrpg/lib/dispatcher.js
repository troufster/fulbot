var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

var Dispatcher = {
    Io : null,
    Emitter : emitter,
    Emit : function(event) {
      emitter.emit(event.Type, event);
      console.log("Emit:" + event.Type);
    }
};

Dispatcher.Emitter.setMaxListeners(1000);

module.exports = Dispatcher;