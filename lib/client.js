"use strict";

let irc = require('irc');
let di = require('di');
var EventEmitter = require('events');

let Configuration = require('./conf');

class Client extends EventEmitter {
  constructor(configuration) {
    this.config = configuration.client;

    this.irc = new irc.Client(
      this.config.server,
      this.config.nick,
      {
        debug : true,
        channels : this.config.channels,
        port : this.config.port,
        autoConnect : false,
        autoRejoin : true
      }
    );

    this.addEventListeners();
  }

  addEventListeners(client) {
    let that = this;

    this.irc.addListener("message", (from, to, message) => { that.emit("message", { from, to, message })});
    this.irc.addListener("error", (message) => { that.emit("error", message)})
  }

  connect() {
    this.irc.connect();
  }

  sendMessage(to, message) {
    this.irc.say(to, message)
  }
}

di.annotate(Client, new di.Inject(Configuration));
di.annotate(Client, new di.Provide(Client));

module.exports = Client;
