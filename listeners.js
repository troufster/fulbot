"use strict";

var util = require('util');
var fs = require("fs");
var Utils = require('./utils').Utils;
var buffertools = require('buffertools');
var ful = new Buffer([0xef, 0xbf, 0xbd]);

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
      bot.addListener("message", function(from, to, message) {
        that.checkListeners(from, to, message);
      });

      //Register main listener
      bot.addListener("action", function(from, to, message) {
        that.checkListeners(from, to, message);
      });
      bot.addListener("join", function(from, to, message) {
        that.checkCommandListeners(from, to, message);
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

        if (lis.match !== undefined){
          this.routes[route].push([lis.match, lis.func]);
        } else if(lis.command !== undefined) {
          this.routes[route].push([lis.command, lis.func]);
        }
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

Listener.prototype.checkListeners =function(from, to, message) {

  if(!this.utils.canSpeak(to)) {
    return;
  }

  var routes = this.routes;
  var bot = this.bot;
  var tochan = Utils.isChanMessage(to);

  var rawmsg = new Buffer(message);

  if(buffertools.indexOf(rawmsg, ful) > -1 && tochan && Utils.isUserOperator(this.bot,to,this.bot.nick)) {
    return this.bot.send('kick', to, from, 'Client sending fuldata, fix your encoding ;)');
  }

  //Command?
  if(!tochan && message.match(/^\./i)) {
    var command = message.substr(1, message.length);

    var cmdFunc = this.commands[command];

    if(cmdFunc){
      return cmdFunc.func.call(this, to, from, message);
    }
  }

  var route = tochan ? routes[to] : routes.priv;

  //Exec route
  if(!route) {
    return;
  }

  route.forEach(function(r) {
    if(message.match(r[0])) {

      tochan ? r[1](bot, from, to, message) : r[1](bot, to, from, message);
    }
  });

};

Listener.prototype.checkCommandListeners = function(from, to, message){
  //message.command
  //message.nick

  if (to === this.bot.nick ) {return;}
  if(!this.utils.canSpeak(from)) {return;}

  var routes = this.routes;
  var bot = this.bot;

  var route = routes[from];

  //Exec route
  if(!route) {return;}

  route.forEach(function(r) {
    if(message.command === r[0]) {
      r[1](bot, from, to, message);
    }
  });

};

exports.Listener = Listener;