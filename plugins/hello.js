'use strict';
var fs = require('fs');
var resourceFile = './resources/hello/hello.json';

function readFileJSON(filename, _cb) {
  fs.readFile(filename, function(e, d) {
    if (e) {
      return _cb(e);
    }
    return _cb(null, JSON.parse(d.toString()));
  });
}

function writeFileJSON(filename, data, _cb) {
  fs.open(filename, 'w', 666, function(err, d) {
    if(err) {
      return _cb(err);
    }

    return fs.write(d, JSON.stringify(data), null, undefined, function(err, written) {
      if(err) {
        return _cb(err);
      }

      fs.close(d,function(){
        return _cb(null, written);
      });

    });
  });
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
  this.data.specialUsers = [];
  this.data.greetings = [];

  this.AddGreeting('%1 Allahu akhbar!!!11');
  this.AddGreeting('%1, Konsultmässighet!');
  this.AddGreeting('Woop woop! %1! DUB DUB DUB DUBBA DUB DUB');

  this.AddUser('ocosmo', null,'http://ho.io/omsoc');



  readFileJSON(resourceFile, function(e, d) {
    if(e) {
      console.log(e);
    }
    that.data.specialUsers = d.specialUsers;
    that.data.greetings = d.greetings;
  });
}

HelloHandler.prototype.AddUser = function(user, greeting, join){
  var u = this.data.specialUsers.filter(function(elem){
    return elem.user === user;
  });

  if (u.length === 0){
    this.data.specialUsers.push(new User(user, greeting, join));
  } else{
    if (greeting !== null || greeting.length === 0) {
      u[0].greetings.push(greeting);
    }
    if (join !== null || join.length === 0) {
      u[0].joins.push(join);
    }
  }

  writeFileJSON(resourceFile, this.data, function(e,d) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

HelloHandler.prototype.AddGreeting = function(greeting){

  if (greeting === undefined || greeting.length === 0) {
    return;
  }

  this.data.greetings.push(greeting);

  writeFileJSON(resourceFile, this.data, function(e,d) {
    if(e) {
      console.log("Could not save file :( :" + e);
    }
  });
};

HelloHandler.prototype.GetSentence = function(user){

  var u = this.data.specialUsers.filter(function(e){
    return e.user === user;
  });

  if (u.length >0 && u[0].greetings.length > 0 ){
    return u[0].greetings[Math.floor(Math.random() * u[0].greetings.length)].replace('%1',user);
  }

  return this.data.greetings[Math.floor(Math.random() * this.data.greetings.length)].replace('%1',user);
};

HelloHandler.prototype.Join = function(user){
  var u = this.data.specialUsers.filter(function(e){
    return e.user === user;
  });

  if (u.length >0 && u[0].joins.length > 0 ){
    return u[0].joins[Math.floor(Math.random() * u[0].joins.length)].replace('%1',user);
  }

  return ' ';
};

var helloHandler = new HelloHandler();

function sayHello(bot, from, to, message) {
  bot.say(to, helloHandler.GetSentence(from));
}

function join(bot, chan, to, message){
var m = helloHandler.Join(message.user);

  if (m !== null){
    bot.say(chan, m);
  }
}

function config(bot, from, to, message){

  var parts = message.split(' ');
  var action = parts[1];

  switch (action){
    case "user":
      var user = parts[2];
      var d = parts.slice(3,parts.length).join(' ').split('|');

      if (d.length === 1){
        helloHandler.AddUser(user, d[0],null);
      } else {
        helloHandler.AddUser(user, d[0],d[1]);
      }

      break;
    case "greeting":
      helloHandler.AddGreeting(parts.slice(2,parts.length).join(' '));
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
    listen : ["#botdev"]
  }];
};
