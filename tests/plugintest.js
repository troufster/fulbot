"use strict";

let di = require('di');
let MockPlugins = require('./mocks/plugins');
let Fulbot = require('../lib/fulbot');


let injector = new di.Injector([MockPlugins]);

let bot = injector.get(Fulbot);

console.log(bot.plugins.read());
