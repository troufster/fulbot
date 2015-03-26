"use strict";
let di = require('di');
let Plugins = require('./plugins');
let Configuration = require('./conf');

class Fulbot {
  constructor(conf, plugins) {
    this.conf = conf;
    this.plugins = plugins;
  }
}
di.annotate(
  Fulbot,
  new di.Inject(Configuration, Plugins)
);


module.exports = Fulbot;

