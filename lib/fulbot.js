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
}
di.annotate(
  Fulbot,
  new di.Inject(Configuration, Plugins, Client)
);


module.exports = Fulbot;

