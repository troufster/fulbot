"use strict";
let di = require('di');
let Resources = require('./resources');

class Plugin extends Resources {
  constructor(config, location) {
    super(location);
    this.config = config;
  }

}


module.exports = Plugin;