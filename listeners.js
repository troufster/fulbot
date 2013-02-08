var util = require('util');
var fs = require("fs");
var Utils = require('./utils').Utils;
var conf = require('./conf');

function Listener(bot) {
  this.listeners = [];
  this.utils =  new Utils();

  this.bot = bot;
  this.utils.init(bot);
  this.routes= {};

  var that = this;

  //Load plugins
  this.loadPlugins(function(err) {

    //Map plugin routes
    that.mapRoutes(function(err, _cb) {

      //Register main listener
      bot.addListener("message", function(from, to, message, raw) {
        that.checkListeners(from, to, message, raw);
      });
    });
  });

}



Listener.prototype.mapRoutes = function(_cb) {

  for(var i = 0, l = this.listeners.length; i < l; i++) {
    var listeners = this.listeners[i];

    for(var j = 0, lj = listeners.length; j<lj; j++) {
      var lis = listeners[j];

      var conflis = conf.pluglisten[lis.name];
      if(!conflis) continue;

      for(var k = 0, lk = conflis.length; k<lk  ; k++) {
        var route = conflis[k];

        if(!this.routes[route]){
          this.routes[route] = [];
        }

        this.routes[route].push([lis.match, lis.func, lis.name]);
      }
    }
  }

  _cb(null);
};

Listener.prototype.addListener = function(l) {
  this.listeners.push(l);
};

Listener.prototype.loadPlugins  = function(_cb) {
  var that = this;

  fs.readdir('./plugins', function(err, f) {
    if(err) throw err;

      for(var i = 0, l = f.length; i < l; i++) {
        var file = f[i];

        if(file.indexOf(".js") < 0) {
          continue;
        }

        var plugName = __dirname.replace(/\\/g,'/' ) + "/plugins/" + file;

        var plug = require(plugName);

        if(plug.listeners) {
          that.addListener(plug.listeners());
        }
    }

    _cb(null);

  });
};

Listener.prototype.checkListeners =function(from, to, message, raw) {

  if(!this.utils.canSpeak(to)) return;;

  var routes = this.routes;
  var bot = this.bot;
  var tochan = Utils.isChanMessage(to);

  var route = tochan ? routes[to] : routes['priv'];

  //Debug
  if(message.match(/^\!showroutes/i)) {
    var c = Object.keys(routes);

    for(var i = 0, l = c.length; i < l; i++) {
      bot.say(to, c[i]);
      var r = routes[c[i]];

      for(var j = 0, jl = r.length; j < jl; j++) {
        bot.say(to, "->" + r[j][0] + "::" + r[j][2]);
      }
    }
  }

  //Exec route
  if(!route) return;

  route.forEach(function(r) {
    if(message.match(r[0])) {
        tochan ? r[1](bot, from, to, message, raw) : r[1](bot, to, from, message, raw);
    }
  });

};

exports.Listener = Listener;

