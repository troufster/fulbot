"use strict";
let di = require('di');
let Client = require('../../lib/client');
var EventEmitter = require('events');

class MockClient extends Client {

  connect() {
    this.actions = [];
    this.messages = [];
    this.connected = true;
  }

  incomingMessage(message) {
    this.emit("message", message);
  }

  action(data) {
    this.actions.push(data);
    this.emit("sentAction", data);
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
