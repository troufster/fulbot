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
  }

  parseMessage(message){
    var that = this;

    var promise = new Promise((resolve, reject) => {
      if(!that.matchMessage(message, that.match)) resolve();

      var d = {
        to: message.to,
        message : that.entry.apply(that)
      };

      resolve(d);
    });

    return promise;
  }
}


module.exports = Plugin;