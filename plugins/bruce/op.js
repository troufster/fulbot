"use strict";
var
  utils = require ('./../../utils.js').Utils,
  util = require('util');

function Identity(nick, handle, pass){
    this.handle = handle;
    this.pass = pass;
    this.nick = nick;
    this.hosts = [];
    this.validated = false;
}

function User(nick, handle){
  this.modes = [];
  this.nick = nick;
  this.handles = [];
  this.handles.push(handle);
}

function Op(bot){
    this.bot = bot;

    this.utils = new utils();
    this.utils.init(this.bot);

    this.ops   = [];
    this.voice = [];
    this.deops = [];
    this.identities = [];

    this.users = [];

    var that = this;
    this.bot.addListener("join", function(channel, nick, message) {

      that.bot.whois(nick,function(data){
        var prefix = data.user + "@" + data.host;

        if (that.ops[channel] && that.ops[channel].indexOf(prefix) > -1){
          that.bot.send("MODE ",  channel , " +o" ,  nick);

        }
      });
    });

    this.bot.addListener("+mode", function(from, nick, mode, user, message) {
      var channel = message.args[0];
      that.bot.whois(user,function(data){
        var prefix = data.user + "@" + data.host;

        if (that.ops[channel] && that.ops[channel].indexOf(prefix) === -1){
          that.bot.send("MODE ",  channel , " -o" ,  user);
          that.bot.send("KICK ",  channel , nick ,  " gtfo");
        }
      });
    });

    this.bot.addListener("-mode", function(from, nick, mode, user, message) {
      var channel = message.args[0];
      that.bot.whois(user,function(data){
        var prefix = data.user + "@" + data.host;

        if (that.ops[channel] && that.ops[channel].indexOf(prefix) > -1){
          that.bot.send("MODE ",  channel , " +o" ,  user);
          that.bot.send("KICK ",  channel , nick , " gtfo");
        }
      });
    });
}

Op.prototype.setMode = function(channel, from, mode, users , rawmessage){
  var identity = this.validateUser(rawmessage);

  if (identity === null) {
    return;
  }

  if (this.utils.isUserOperator(channel,this.bot.nick) && this.utils.isUserOperator(channel, from)){
    var u = users.split(' ');
    var that = this;
    u.forEach(function(user){
      this.addUser(channel, user);
      if (that.utils.isUserOnChannel(channel, user)) {
        that.bot.send("MODE ",  channel , mode ,  user);
        that.users[channel] = null;
      }
    });


  } else if(!this.utils.isUserOperator(channel, from)) {
    this.bot.say(from, "Oy! You no op, boy!");
  } else {
    this.bot.say(from, "Oy! Me no op, boy!");
  }
};

Op.prototype.op= function(channel, from, newOp, message){
  var identity = this.validateUser(message);

  if (identity === null) {
    return;
  }

  if (this.utils.isUserOperator(channel,this.bot.nick) /*&& this.utils.isUserOperator(channel, from)*/){
    this.addOp(channel, newOp);
    if (this.utils.isUserOnChannel(channel, newOp)) {
      this.bot.send("MODE ",  channel , " +o" ,  newOp);
    }
  } else if(!this.utils.isUserOperator(channel, from)) {
    this.bot.say(from, "Oy! You no op, boy!");
  } else {
    this.bot.say(from, "Oy! Me no op, boy!");
  }
};




Op.prototype.checkRemoveOp = function(from, nick, mode, user, message){

};

Op.prototype.checkOp = function(from, nick, mode, user, message){

};

Op.prototype.addUser = function(channel, nick){
  if(!this.users[channel]){
    this.users[channel] = [];
  }

  var that = this;
  this.bot.whois(nick,function(data){
    var handle = data.user + "@" + data.host;



      var user = that.users.some(function(u) {
        return (u.handles.indexOf(handle) > -1);
      });

      if (!user) {
        user = new User(nick, handle);
        that.users[channel].push(user);
      }
  });
};

Op.prototype.addOp = function(channel, user){
    if(!this.ops[channel]){
        this.ops[channel] = [];
    }

    if(!this.deops[channel]){
        this.deops[channel] = [];
    }

    var that = this;
    this.bot.whois(user,function(data){
        var prefix = data.user + "@" + data.host;

        if(that.ops[channel].indexOf(prefix) === -1 && that.deops[channel].indexOf(prefix) === -1 ){
            that.ops[channel].push(prefix);
        }
    });

};

Op.prototype.deop = function(channel, user){
    if(!this.deops[channel]){
        this.deops[channel] = [];
    }

    if(!this.ops[channel]){
        this.ops[channel] = [];
    }

    var that = this;
    this.bot.whois(user,function(data){
        var prefix = data.user + "@" + data.host;

        if(that.deops[channel].indexOf(prefix) === -1 && that.ops[channel].indexOf(prefix) === -1 ){
            that.deops[channel].push(prefix);
        }
    });
};

Op.prototype.ident = function (to, handle, pass, raw) {

    if (handle === undefined || pass === undefined){
      this.bot.say(to," Learn to ident! "  );
      return false;
    }

    var valid = this.identities.some(function(identity) {
        return identity.handle === handle && identity.pass === pass;
    });

    var identity = null;
    if (valid){


        for(var i = this.identities.length-1;i >= 0; i--){
            if (this.identities[i].handle === handle && this.identities[i].pass === pass){
                identity = this.identities[i];
                i = -1; //break;
            }
        }


        if (identity.hosts.indexOf(raw.user + "@" + raw.host) === -1){
            identity.hosts.push(raw.user + "@" + raw.host);
        }

        identity.nick = raw.nick;
        this.bot.say(to, "Hi " + identity.nick);
        return true;
    }

    identity = this.identities.some(function(identity) {
        return (identity.handle === handle);
    });

    if (!identity) {

        var exists = this.identities.some(function(identity) {
            return identity.hosts.some(function(host){
                return host === raw.user + "@" + raw.host;
            });
        });

        if (!exists) {
            identity = new Identity(raw.nick, handle, pass);
            identity.hosts.push(raw.user + "@" + raw.host);
            this.identities.push(identity);

            this.bot.say(to, "Your handle is now registered.");
            return true;
        }

        this.bot.say(to, "you're already registered under a different handle");
        return false;
    }
    this.bot.say(to, "Y U NO IDENT CORRECTLY!!!");
    return false;
};

Op.prototype.hello = function(to, raw){

    var identity = this.validateUser(raw);

    if (identity){
        this.bot.say(to,"hmmm, I see what you did there..");
    }
};

Op.prototype.validateUser = function(raw){

    var identity = this.identities.some(function(id){
      if (id.hosts.some(function(host){
        return host === raw.user + "@" + raw.host;})){
          return id;
        }
      return null;
    });

    if (identity) {
        return identity;
    }
    this.bot.say(raw.nick, "WHY THE FUCK DON'T YOU IDENT FIRST!");
    return null;
};

Op.prototype.operators = function(channel, to){

    if (this.ops[channel] !== undefined) {
      this.bot.say(to, util.format("Following hostmasks are op: %s", this.ops[channel].join(' ')));
    }
};

module.exports = Op;