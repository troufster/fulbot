var util = require('util');
var fs = require("fs");
var Utils = require('./utils').Utils;

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
      bot.addListener("message", function(from, to, message) {
        that.checkListeners(from, to, message);
      });

    });
  });

}



Listener.prototype.mapRoutes = function(_cb) {

  for(var i = 0, l = this.listeners.length; i < l; i++) {
    var listeners = this.listeners[i];

    for(var j = 0, lj = listeners.length; j<lj; j++) {
      var lis = listeners[j];

      for(var k = 0, lk = lis.listen.length; k<lk  ; k++) {
        var route = lis.listen[k];

        if(!this.routes[route]){
          this.routes[route] = [];
        }

        this.routes[route].push([lis.match, lis.func]);
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

Listener.prototype.checkListeners =function(from, to, message) {

  if(!this.utils.canSpeak(to)) return;;

  var routes = this.routes;
  var bot = this.bot;
  var tochan = Utils.isChanMessage(to);

  var route = tochan ? routes[to] : routes['priv'];

  //Debug
  if(message.match(/\!chanlisteners/i)) {
    for(var i = 0, l = this.listeners.length; i < l; i++) {
      var listener = this.listeners[i];
      for(var j = 0, jl = listener.length; j < jl; j++) {

        this.bot.say(to, i + ": " + listener[j].name + "::" +  listener[j].match + "::" + listener[j].listen);
      }

    }
  }

  //Exec route
  if(!route) return;

  route.forEach(function(r) {
    if(message.match(r[0])) {

      tochan ? r[1](bot, from, to, message) : r[1](bot, to, from, message);
    }
  });

};

exports.Listener = Listener;

