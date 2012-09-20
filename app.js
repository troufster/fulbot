#!/usr/bin/env node

var irc = require("irc");

var bot = new irc.Client("irc.isolated.se", "Olla", {
  debug: true,
  channels : ["#trivia"]
});

bot.addListener("message", function(from, to, message) {
  if( to.match(/^[#&]/)) {
    if ( message.match(/\!hello/i)) {
      bot.say(to, "Dra åt helvete " + from);
    }
  }
});


