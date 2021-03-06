'use strict';
var
  fs = require('fs'),
  configMixin = require('../resourceManager.js').mixin;


var resourceFile = 'hello.json';

function Channel(name){
  this.name = name;
  this.specialUsers = [];
  this.greetings = [];
}

function User(user, greeting, join){
  this.user = user;

  this.greetings = [];
  if (greeting !== null){
    this.greetings.push(greeting);
  }

  this.joins = [];
  if (join !== null){
    this.joins.push(join);
  }
}

function HelloHandler() {
  var that = this;
  this.data = {};
  this.data.channels = [];

/*
  this.data.specialUsers = [];
  this.data.greetings = [];
*/

  this.load('hello', resourceFile, function(e, d) {
    if(e) {
      console.log(e);
      return;
    }
    if (d !== undefined) {
      that.data = d;
    }


    /* .specialUsers = d.specialUsers;
    that.data.greetings = d.greetings;*/
  });
}

//mixin;
configMixin(HelloHandler);


HelloHandler.prototype.getChannel =  function(name){
  var chan = this.data.channels.filter(function(c){
    return c.name === name;
  });

  if (chan.length === 0){
    var c = new Channel(name);
    this.data.channels.push(c);
    return c;
  }
  else{
    return chan[0];
  }
};


HelloHandler.prototype.AddUser = function(channel, user, greeting, join){

  var chan = this.getChannel(channel);

  var u = chan.specialUsers.filter(function(elem){
    return elem.user === user;
  });

  if (u.length === 0){
    chan.specialUsers.push(new User(user, greeting, join));
  } else{
    if (greeting !== null || greeting.length === 0) {
      u[0].greetings.push(greeting);
    }
    if (join !== null || join.length === 0) {
      u[0].joins.push(join);
    }
  }

  this.save('hello', resourceFile, this.data, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

HelloHandler.prototype.AddGreeting = function(channel, greeting){

  if (greeting === undefined || greeting.length === 0) {
    return;
  }

  var chan = this.getChannel(channel);
  chan.greetings.push(greeting);

  this.save('hello', resourceFile, this.data, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

HelloHandler.prototype.GetSentence = function(channel, user){

  var chan = this.getChannel(channel);
  var u = chan.specialUsers.filter(function(e){
    return e.user === user;
  });

  if (u.length >0 && u[0].greetings.length > 0 ){
    return u[0].greetings[Math.floor(Math.random() * u[0].greetings.length)].replace('%1',user);
  }

  if (chan.greetings.length > 0){
    return chan.greetings[Math.floor(Math.random() * chan.greetings.length)].replace('%1',user);
  }

  return "";
};

/**
 * @return {null}
 */
HelloHandler.prototype.Join = function(channel, user){

  var chan = this.getChannel(channel);
  var u = chan.specialUsers.filter(function(e){
    return e.user === user;
  });

  if (u.length >0 && u[0].joins.length > 0 ){
    return u[0].joins[Math.floor(Math.random() * u[0].joins.length)].replace('%1',user);
  }

  return null;
};

HelloHandler.prototype.Reset = function(channel){

  if (this.data.channels !== undefined){
    var chan = this.getChannel(channel);

    chan.specialUsers = [];
    chan.greetings = [];

    this.AddUser(channel, 'ocosmo', null,'http://ho.io/omsoc');
  } else {
    this.data = {};
    this.data.channels = [];
  }

  this.save('hello', resourceFile, this.data, function(e) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

var helloHandler = new HelloHandler();

function sayHello(bot, from, to) {
  bot.say(to, helloHandler.GetSentence(to, from));
}

function join(bot, chan, to, message){
var m = helloHandler.Join(chan, message.nick);

  if (m !== null){
    bot.say(chan, m);
  }
}

function config(bot, from, to, message){

  var parts = message.split(' ');
  var action = parts[1];
  var channel = parts[2];

  /*
  if (!bot.isUserOperator(channel, to)){
    return;
  }*/

  switch (action){
    case "user":
      var user = parts[3];
      var d = parts.slice(4,parts.length).join(' ').split('|');

      if (d.length === 1){
        helloHandler.AddUser(channel, user, d[0],null);
      } else {
        helloHandler.AddUser(channel, user, d[0],d[1]);
      }

      break;
    case "greeting":
      helloHandler.AddGreeting(channel, parts.slice(3,parts.length).join(' '));
      break;
    case "reset":
      helloHandler.Reset(channel);
      break;

  }


}

exports.listeners = function(){
  return [{
    name : '!hello listener',
    match : /!hello/i,
    func : sayHello,
    listen : ["#sogeti", "#botdev"]
  },
  {
    name : '!hello listener',
    match : /!ConfigHello/i,
    func : config,
    listen : ["priv"]
  },
  {
    name : "join listener",
    command : 'JOIN',
    func : join,
    listen : ["#sogeti","#botdev"]
  }];
};
