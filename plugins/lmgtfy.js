
'use strict';
var
  fs = require('fs'),
  configMixin = require('../resourceManager.js').mixin;


var resourceFile = 'lmgtfy.json';

function Handler() {
  var that = this;
  this.data = {};
  this.data.users = [];

  this.load('lmgtfy', resourceFile, function(e, d) {
    if(e) {
      console.log(e);
      return;
    }
    if (d !== undefined) {
      that.data = d;
    }
  });
}

//mixin;
configMixin(Handler);

Handler.prototype.AddUser = function(user){

  if (this.data.users.indexOf(user) >= 0) {return;}

  this.data.users.push(user);

  this.save('lmgtfy', resourceFile, this.data, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

Handler.prototype.RemoveUser = function(user){

  var n = this.data.users.indexOf(user);
  if (n < 0) {return;}

  this.data.users.splice(n,1);

  this.save('lmgtfy', resourceFile, this.data, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

Handler.prototype.changeNick = function(o, n){
  var index = this.data.users.indexOf(o);
  console.log(o);
  console.log(n);
  if (index > -1){
    this.data.users[index] = n;
    this.save('lmgtfy', resourceFile, this.data, function(e) {
      if(e) {
        console.log("Could not save file :( :" + e);
      }
    });
  }
};

var handler = new Handler();

function notify(bot, from, to, message){
  // http://lmgtfy.com/?q=vilken+leverantör+ska+man+ha+på+internetzors+då%3F

  if (handler.data.users.indexOf(from) < 0) {return;}

  var url = 'http://lmgtfy.com/?q=' + message.replace(/ /g, '+').replace('?','%3F');


  bot.notice(from, url);

}

function config(bot, from, to, message){

  var parts = message.split(' ');
  var action = parts[1];
  var user = parts[2];

  switch (action){
    case "+":
      handler.AddUser(user);
      break;
    case "-":
      handler.RemoveUser(user);
      break;
  }
}

function updateNick(bot, oldNick, newNick, message){
  handler.changeNick(oldNick,newNick);
}

exports.listeners = function(){
  return [{
      name : '!lmgtfy listener',
      match : /.+\?$/i,
      func : notify,
      listen : ["#botdev","#sogeti"]
    },
    {
      name : '!lmgtfy config',
      match : /!lmgtfy/i,
      func : config,
      listen : ["priv"]
    },
    {
      name : "nick listener",
      command : 'NICK',
      func : updateNick,
      listen : ["#sogeti","#botdev"]
    }];
};
