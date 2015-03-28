"use strict";
let di = require('di');
let Resources = require('./resources');

let Fulbot = require('./fulbot');
let injector = new di.Injector([]);



class Plugin extends Resources {
  constructor(config, location) {
    super(location);
    this.config = config;
    this.bot = injector.get(Fulbot);
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