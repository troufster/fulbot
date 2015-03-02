"use strict";

var irc = require("irc");
var Listener = require("./listeners").Listener;
var conf = require("./conf");
var NickServ = require('nickserv');

//var utils = require('./utils.js');

var bot;
bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels: conf.channels,
  port: conf.port
});

var nickserv = new NickServ(conf.nick, {
  password: conf.password,
  email: conf.email
});

nickserv.attach('irc', bot);

// nickserv.ready(function(err) {
// if (err) throw err;
// });

require('./utils.js').Utils.call(bot);

var listeners = new Listener(bot);