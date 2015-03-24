"use strict";

var irc = require("irc");
var BotListener = require("./listeners").BotListener;
var conf = require("./conf");

var bot;
bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels: conf.channels,
  port: conf.port
});

require('./utils.js').Utils.call(bot);

let listener = new BotListener(bot);

//Load plugins
listener.loadPlugins(function() {

  //Map plugin routes
  listener.mapRoutes(function() {

    listener.bot.addListener("registered", function(message) {
      listener.checkServerListeners(message);
    });

    //Register main listener
    listener.bot.addListener("message", function(from, to, message) {
      listener.checkListeners(from, to, message);
    });

    listener.bot.addListener("action", function(from, to, message) {
      listener.checkListeners(from, to, message);
    });

    listener.bot.addListener("join", function(from, to, message) {
      listener.checkCommandListeners(from, to, message);
    });
  });
});
