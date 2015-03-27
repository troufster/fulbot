"use strict";
let di = require('di');
let Client = require('../../lib/client');
var EventEmitter = require('events');

class MockClient extends EventEmitter {
  constructor() {
    this.connected = false;
    this.messages = [];
  }

  connect() {
    this.connected = true;
  }

  incomingMessage(message) {
    this.emit("message", message);
  }

  sendMessage(message) {

    if(message instanceof Array) {
      for(let m of message) {
        this.messages.push(m);

        this.emit("sentMessage", message);
      }
    } else {

    }


  }
}

di.annotate(MockClient, new di.Provide(Client));

module.exports = MockClient;
