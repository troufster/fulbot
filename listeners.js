util = require('util');
var fs = require("fs");
var Utils = require('./utils').Utils;

function Listener() {
  this.listeners = [];
  this.bot = null;
  this.utils =  new Utils();
}

Listener.prototype.addListener = function(l) {
  this.listeners.push(l);
}

Listener.prototype.init = function(bot) {
  this.bot = bot;
  this.utils.init(bot);
}

Listener.prototype.loadPlugin =  function (plugName, unload) {

    if (unload){
        var f = require.resolve(plugName);
        if (require.cache[f].exports.unload !== undefined) {
            require.cache[f].exports.unload();
        }

        delete require.cache[f];
    }
    var plug = require(plugName);

    if (plug.listener !== undefined) {
        var listener = plug.listener();
        if(listener.listen.indexOf('chan') > -1) {
            this.addListener(listener);
        }
    }

    if (plug.listeners !== undefined)
    {
        var ls = plug.listeners();
        for(var i = ls.length-1;i>=0;i--){
            this.addListener(ls[i]);
        }
    }

}

Listener.prototype.loadPlugins = function(cb, plugin, unload){
    var that = this;
    if (plugin == null) {
        this.listeners = [];

        fs.readdir(__dirname + '/plugins', function(err, f) {
            if(err)
                throw err;

            f.forEach(function(file) {
                if(file.indexOf(".js") < 0) return;
                var plugName = __dirname.replace(/\\/g,'/' ) + "/plugins/" + file;
                that.loadPlugin(plugName, unload);

            });
        });
        if (cb != null){cb(null, "All plugins have been reloaded.");}
    } else {
        //find named plugin
        for (var i = this.listeners.length -1; i>=0;i--){

            if(this.listeners[i].name == plugin){
                this.listeners.splice(i,1);
            }
        }

        var plugName = __dirname.replace(/\\/g,'/' ) + "/plugins/" + plugin + '.js';
        fs.exists(plugName  , function (exists) {
            if (exists) {
                that.loadPlugin(plugName, unload);
                if (cb != null){cb(null, util.format("%s reloaded", plugin));}
            }else {
                if (cb != null){ cb(null, util.format("file for %s not found", plugin));}
            }
        });
    }

};



Listener.prototype.checkListeners =function(from, to, message) {
  for(var i = 0, l = this.listeners.length; i < l; i++) {
   var listener = this.listeners[i];
   if(message.match(listener.match)) {
     listener.func(this.bot, from, to, message);
   }  
  }

  //Debug
  if(message.match(/\!chanlisteners/i)) {
    for(var i = 0, l = this.listeners.length; i < l; i++) {
      var listener = this.listeners[i];
      this.bot.say(to, i + ": " + listener.name + "::" +  listener.match);
    }
  }
  if(message.match(/\!chaninitplugins/i)){
    if (this.utils.isUserOperator(to, from)){
        var parts = message.split(" ");
        parts = parts.slice(1,parts.length);
        var that = this;
        if (parts.length > 0) {

            parts.forEach(function(p){
                that.loadPlugins(function(err, d) {
                    if(err) return;
                    that.bot.say(to, d);
                }, p, true);
            });
        } else {
            this.loadPlugins(function(err, d) {
                if(err) return;
                that.bot.say(to, d);
            }, null, true);
        }
    } else {
        this.bot.say(to, "Sorry, you need to be op to use this command.");
    }

  }
}

exports.Listener = Listener;

