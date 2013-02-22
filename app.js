var irc = require("irc");
var Listener = require("./listeners").Listener;
var conf = require("./conf");


var bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels : conf.channels
});

var listeners = new Listener(bot);

process.on('uncaughtException', function(err) {
  console.log(err);
});


