"use strict";

let di = require('di');

let Fulbot = require('../../lib/fulbot');
let Plugin = require('../../lib/plugin');

let injector = new di.Injector([]);
let bot = injector.get(Fulbot);

class Test extends Plugin {

  get settings() {
    return {
      match : [/^!test/i],
      entry : this.stuff,
      resources : false
    }}

  stuff() {
    var x = bot;
    return "test";
  }

}

module.exports = Test;