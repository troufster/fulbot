"use strict";
let di = require('di');
let Plugins = require('../../lib/plugins');

class MockPlugins {
  read() {

  }
}

di.annotate(MockPlugins, new di.Provide(Plugins));

module.exports = MockPlugins;