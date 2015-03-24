"use strict";

let fs = require("fs");
let Utils = require('./utils').Utils;
let buffertools = require('buffertools');
let ful = new Buffer([0xef, 0xbf, 0xbd]);


class Listener {
  constructor() {
    this._listeners = [];
  }

  get listeners() {
    return this._listeners;
  }

  set listeners(l) {
    this._listeners = l;
  }

}

class BotListener extends Listener{
  constructor(bot){
    this.commands = {};
    this.utils =  new Utils();

    this.bot = bot;
    this.utils.init(bot);
    this.routes= {};
  }

  loadPlugins (_cb) {
    let that = this;

    function load(path, partial, cb) {
      return new Promise(function(resolve,reject){
        fs.readdir(path, function (err, f) {
          if (err) {
            reject(err);
          }

          for (let i = 0, l = f.length; i < l; i++) {
            let file = f[i];

            if (file.indexOf(".js") >= 0) {

              let plugName = __dirname.replace(/\\/g, '/') + partial + file;

              let plug = require(plugName);

              if (plug.listeners) {
                cb.call(that,plug.listeners());
              }
            }
          }
          resolve(true);
        });
      })
    };

    Promise.all([
      load('./plugins', '/plugins/', this.addListener),
      load('./commands', '/commands/', this.addCommand)
    ]).then(_cb);

  }

  mapRoutes (_cb) {

    for(let i = 0, l = this.listeners.length; i < l; i++) {
      let listeners = this.listeners[i];

      for(let j = 0, lj = listeners.length; j<lj; j++) {
        let lis = listeners[j];

        for(let k = 0, lk = lis.listen.length; k<lk  ; k++) {
          let route = lis.listen[k];

          if(!this.routes[route]){
            this.routes[route] = [];
          }

          if (lis.match !== undefined){
            this.routes[route].push([lis.match, lis.func]);
          } else if(lis.command !== undefined) {
            this.routes[route].push([lis.command, lis.func]);
          }
        }
      }
    }

    _cb(null);
  }

  addListener (l) {
    this.listeners().push(l);
  }

  addCommand (c) {
    this.commands[c.cmd] = c;
  }

  checkListeners (from, to, message) {

    if(!this.utils.canSpeak(to)) {
      return;
    }

    let routes = this.routes;
    let bot = this.bot;
    let tochan = Utils.isChanMessage(to);

    let rawmsg = new Buffer(message);

    if(buffertools.indexOf(rawmsg, ful) > -1 && tochan && Utils.isUserOperator(this.bot,to,this.bot.nick)) {
      return this.bot.send('kick', to, from, 'Client sending fuldata, fix your encoding ;)');
    }

    //Command?
    if(!tochan && message.match(/^\./i)) {
      let command = message.substr(1, message.length);

      let cmdFunc = this.commands[command];

      if(cmdFunc){
        return cmdFunc.func.call(this, to, from, message);
      }
    }

    let route = tochan ? routes[to] : routes.priv;

    //Exec route
    if(!route) {
      return;
    }

    route.forEach(function(r) {
      if(message.match(r[0])) {

        tochan ? r[1](bot, from, to, message) : r[1](bot, to, from, message);
      }
    });

  }

  checkServerListeners (message){
    let routes = this.routes;
    let bot = this.bot;

    let route = routes['server'];

    //Exec route
    if(!route) {return;}

    route.forEach(function(r) {
      r[1](bot, message);
    });
  }

  checkCommandListeners (from, to, message){
    //message.command
    //message.nick

    if (to === this.bot.nick ) {return;}
    if(!this.utils.canSpeak(from)) {return;}

    let routes = this.routes;
    let bot = this.bot;

    let route = routes[from];

    //Exec route
    if(!route) {return;}

    route.forEach(function(r) {
      if(message.command === r[0]) {
        r[1](bot, from, to, message);
      }
    });

  }
}


exports.Listener = Listener;
exports.BotListener = BotListener;