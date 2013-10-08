"use strict";

var irc = require("irc");
var Listener = require("./listeners").Listener;
var conf = require("./conf");

//var utils = require('./utils.js');

var bot;
bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels: conf.channels
});

require('./utils.js').Utils.call(bot);

var listeners = new Listener(bot);