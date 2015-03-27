"use strict";

let irc = require('irc');
let di = require('di');

let EventEmitter = require('events');
let Configuration = require('./conf');

class Client extends EventEmitter {
  constructor(configuration) {
    this.config = configuration.client;

    this.irc = new irc.Client(
      this.config.server,
      this.config.nick,
      {
        debug : true,
        channels : this.config.channels,
        port : this.config.port,
        autoConnect : false,
        autoRejoin : true
      }
    );

    this.addEventListeners();
  }

  addEventListeners(client) {
    let that = this;

    this.irc.addListener("message", (from, to, message) => { that.emit("message", { from, to, message })});
    this.irc.addListener("error", (message) => { that.emit("error", message)})
  }

  connect() {
    this.irc.connect();
  }

  action(data) {
    if(!this.canSpeak(data.original.to)) return;

    switch(data.action) {
      case "kick":
        //Original message should be to chan + client should be op
        if(this.isChanMessage(data.original.to) && this.isOperator(this.irc, this.irc.nick)){
          this.irc.send(data.action,data.to,data.from, data.reason);
        }
        break;
    }
  }

  sendMessage(message) {
    if(message instanceof Array) {
      for(let m of message) {
        if(!this.canSpeak(m.to)) continue;

        this.irc.say(m.to, m.message);
      }
    }
  }

  isOperator(channel, nick) {
    var n = this.irc.chans[channel].users[nick];

    if(n === undefined) {
      return false;
    }

    return n.indexOf("@") > -1 || n.indexOf("%") > -1 || n.indexOf("~") > -1;
  }

  isChanMessage(to) {
    return !!(to.match(/^[#&]/));
  }

  canSpeak(channel) {
    if(!this.isChanMessage(channel)) return true;

    var isChanModerated = this.irc.chans[channel].mode.indexOf('m') > -1;
    var haveVoice = this.irc.chans[channel].users[this.irc.nick].indexOf('+') > -1;

    return !isChanModerated || haveVoice;
  }
}

di.annotate(Client, new di.Inject(Configuration));
di.annotate(Client, new di.Provide(Client));

module.exports = Client;
