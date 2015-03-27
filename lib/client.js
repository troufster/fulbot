"use strict";

let irc = require('irc');
let di = require('di');

let Configuration = require('./conf');

class Client {
  constructor(configuration) {
    this.config = configuration.client;

    this.irc = new irc.Client(
      this.config.server,
      this.config.nick,
      {
        debug : true,
        channels : this.config.channels,
        port : this.config.port
      }
    );
  }

  connect() {

  }
}

di.annotate(Client, new di.Inject(Configuration));
di.annotate(Client, new di.Provide(Client));

module.exports = Client;
