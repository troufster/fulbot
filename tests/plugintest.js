"use strict";

let di = require('di');
let MockPlugins = require('./mocks/plugins');
let Fulbot = require('../lib/fulbot');


var injector = new di.Injector([MockPlugins]);

var bot = injector.get(Fulbot);

console.log(bot.plugins.read());
