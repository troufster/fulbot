"use strict";
let di = require('di');

let Plugins = require('./plugins');
let Configuration = require('./conf');
let Client = require('./client');

class Fulbot {
  constructor(conf, plugins, client) {
    this.conf = conf;
    this.plugins = plugins;
    this.client = client;
  }

  connect() {
    let that = this;

    return new Promise((resolve, reject) => {
      that.plugins.load().then(() => {
        that.client.connect();
        that.plugins.listenTo(that.client);

        that.plugins.on("response", (message) => {
          that.response(message);
        });

        resolve();
      });
    });
  }

  response(message) {
    this.client.sendMessage(message);
  }
}

di.annotate(
  Fulbot,
  new di.Inject(Configuration, Plugins, Client)
);


module.exports = Fulbot;

