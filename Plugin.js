"use strict";

class Plugin {
  constructor(){
    this.listeners = [];
  }

  parseMessage (message,bot, from, to){
    let that = this;
    this.listeners.forEach(function(l){
      if(message.match(l.m)){
        l.cb.call(that, bot, from, to, message);
      }
    });

  }
}

exports.Plugin = Plugin;