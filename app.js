#!/usr/bin/env node

var irc = require("irc");
var chanlisteners = require('./listeners');


var conf = {
  server : "irc.isolated.se",
  channels : ["#botdev"],
  nick : "Olla"
};

var bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels : conf.channels
});


chanlisteners.addListener({
  name : "!hello trigger",
  match : /\!hello/i,
  func : function(from, to, message) {
    bot.say(to, "Allahu akhbar!");
  }
});

chanlisteners.init(bot);

bot.addListener("message", function(from, to, message) {
  if( to.match(/^[#&]/)) {
    //Chan msg
    chanlisteners.checkListeners(from, to, message);
  } else {
    //Priv msg
  }
});


