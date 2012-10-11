var irc = require("irc");
var Listener = require("./listeners").Listener;

//Todo: Move to conf.json
var conf = {
  server : "irc.isolated.se",
  channels : ["#botdev", "#martin"],
  nick : "Ulla2"
};


var bot = new irc.Client(conf.server, conf.nick, {
  debug: true,
  channels : conf.channels
});

var listeners = new Listener(bot);


