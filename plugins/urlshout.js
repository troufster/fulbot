'use strict';
var
  fs = require('fs'),
  configMixin = require('../resourceManager.js').mixin;

var resourceFile = 'urlshout.json';

function urlShout() {
  this.parsers = [];
  this.subscribers = [];
  var that = this;

  this.load('urlshout', resourceFile, function(e, d) {
    if(e) {
      console.log(e);
      return;
    }
      if (d !== undefined) {
          that.subscribers = d;
      }
  });

  this.LoadPlugins();
}

//mixin
configMixin(urlShout);

urlShout.prototype.LoadPlugins = function(){
  var that = this;

  fs.readdir('./plugins/urlshout', function(err, f) {
    if(err) {
      throw err;
    }

    for(var i = 0, l = f.length; i < l; i++) {
      var file = f[i];

      if(file.indexOf(".js") < 0) {
        continue;
      }

      var plugName = __dirname.replace(/\\/g,'/' ) + "/urlshout/" + file;

      var plug = require(plugName);

      if(plug.parseUrl) {
        that.addParser(plug.parseUrl);
      }
    }
  });
}

urlShout.prototype.addParser = function(parser){
  this.parsers.push(parser);
}

urlShout.prototype.saveSubscribers = function(){
  this.save('urlShout', resourceFile, this.subscribers, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

urlShout.prototype.addUser = function(user){
  if (this.subscribers.indexOf(user) === -1){
    this.subscribers.push(user);
    this.saveSubscribers();
  }
};

urlShout.prototype.removeUser = function(user){
  var index = this.subscribers.indexOf(user);
  if (index > -1){
    this.subscribers.splice(index,1);
    this.saveSubscribers();
  }
};

urlShout.prototype.changeNick = function(o, n){
  var index = this.subscribers.indexOf(o);
  if (index > -1){
    this.subscribers[index] = n;
    this.saveSubscribers();
  }
};

var shouter = new urlShout();


function parseUrl(bot, from, to, message){
  var ua = Object.keys(bot.chans[to].users);

  shouter.parsers.forEach(function(r) {
    r(message, function(err,text){
      if(err)return;
      for(var i = shouter.subscribers.length-1;i >= 0;i--){
        if (ua.indexOf(shouter.subscribers[i]) > -1){
          bot.notice(shouter.subscribers[i],text);
        }
      }
    });
  });
}

function subscribeUser(bot, from, to, message){
  shouter.addUser(from);
}

function unsubscribeUser(bot, from, to, message){
  shouter.removeUser(from);
}

function updateNick(bot, oldNick, newNick, message){
  shouter.changeNick(oldNick,newNick);
}

exports.listeners = function(){
  return [{
    name : 'Url Parser',
    match : /(.*)/i,
    func : parseUrl,
    listen : ["#botdev","#sogeti"]
  },
    {
    name: 'Url - subscribe',
    match: /^!urlreg*/,
    func: subscribeUser,
    listen: ["#botdev","#sogeti", "priv"]
  },
  {
    name: 'Url - unsubscribe',
    match: /^!urlunreg*/,
    func: unsubscribeUser,
    listen: ["#botdev","#sogeti", "priv"]
  },
  {
    name : "nick listener",
    command : 'NICK',
    func : updateNick,
    listen : ["#sogeti","#botdev"]
  }];
};
