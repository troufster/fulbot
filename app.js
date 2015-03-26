"use strict";

var irc = require("irc");
var fulbot = require("./fulbot").fulbot;
var conf = require("./conf");

var bot;
bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels: conf.channels,
  port: conf.port
});

require('./utils.js').Utils.call(bot);

let listener = new fulbot(bot);
