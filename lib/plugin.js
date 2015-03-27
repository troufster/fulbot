"use strict";
let di = require('di');
let Resources = require('./resources');

class Plugin extends Resources {
  constructor(config, location) {
    super(location);
    this.config = config;
  }

  matchMessage(m, regexps) {
    for(let regexp of regexps) {
      if(m.message.match(regexp)){
        return true;
      }
    }
    return false;
  }

  parseMessage(message){
    var that = this;

    return new Promise((resolve, reject) => {
      if(!that.matchMessage(message, that.settings.match)) return resolve();

      var d = {
        from : message.from,
        to: message.to,
        message : that.settings.entry.call(that, message.message)
      };

      resolve(d);
    });
  }
}


module.exports = Plugin;