#!/usr/bin/env node

var irc = require("irc");
var Listener = require('./listeners').Listener;
var chanlisteners = new Listener();



var conf = {
  server : "irc.isolated.se",
  channels : ["#botdev" /*, "#sogeti"*/],
  nick : "hangman"
};

var bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels : conf.channels
});

chanlisteners.loadPlugins(null,null, false);
chanlisteners.init(bot);

bot.addListener("message", function(from, to, message) {
  console.log(to);
  if( to.match(/^[#&]/)) {
    //Chan msg
    chanlisteners.checkListeners(from, to, message);
  } else {
    //Priv msg
  }
});



