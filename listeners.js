var util = require('util');
var fs = require("fs");
var Utils = require('./utils').Utils;

function Listener(bot) {
    this.listeners = [];
    this.commands = {};
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

Listener.prototype.addCommand = function(c) {
  this.commands[c.cmd] = c;
};

Listener.prototype.loadPlugins  = function(_cb) {
    var that = this;
    var dispatch = 2;

    //Await both async ops
    function cb() {
      if(dispatch == 0) _cb(null);
    }

    fs.readdir('./plugins', function(err, f) {
        if(err) throw err;

        for(var i = 0, l = f.length; i < l; i++) {
            var file = f[i];

            if(file.indexOf(".js") < 0) {
                continue;
            }

            var plugName = __dirname.replace(/\\/g,'/' ) + "/plugins/" + file;
            console.log(plugName);
            var plug = require(plugName);

            if(plug.listeners) {
                that.addListener(plug.listeners());
            }
        }

        dispatch--;
        cb();

    });

  fs.readdir('./commands', function(err, f) {
    if(err) throw err;

    for(var i = 0, l = f.length; i < l; i++) {
      var file = f[i];

      if(file.indexOf(".js") < 0) {
        continue;
      }

      var plugName = __dirname.replace(/\\/g,'/' ) + "/commands/" + file;

      var plug = require(plugName);

      if(plug.listeners) {
        that.addCommand(plug.listeners());
      }
    }

    dispatch--;
    cb();

  });
};

Listener.prototype.checkListeners =function(from, to, message, raw) {

  if(!this.utils.canSpeak(to)) return;

  var routes = this.routes;
  var bot = this.bot;
  var tochan = Utils.isChanMessage(to);

  //Command?
  if(!tochan && message.match(/^\./i)) {
    var command = message.substr(1, message.length);

    var cmdFunc = this.commands[command];

    if(cmdFunc){
      return cmdFunc.func.call(this, to, from, message);
    }
  }

  var route = tochan ? routes[to] : routes['priv'];

  //Exec route
  if(!route) return;

  route.forEach(function(r) {
    if(message.match(r[0])) {

      tochan ? r[1](bot, from, to, message, raw) : r[1](bot, to, from, message, raw);
    }
  });

};

exports.Listener = Listener;