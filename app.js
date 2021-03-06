"use strict";

var irc = require("irc");
var Listener = require("./listeners").Listener;
var conf = require("./conf");

var bot;
bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels: conf.channels,
  port: conf.port
});

require('./utils.js').Utils.call(bot);

var listeners = new Listener(bot);