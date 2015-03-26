"use strict";

let di = require('di');

class Plugins {
  read() {

  }
}

di.annotate(Plugins, new di.Provide(Plugins))

module.exports = Plugins;