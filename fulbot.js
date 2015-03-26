"use strict";

let fs = require("fs");
let Utils = require('./utils').Utils;
let buffertools = require('buffertools');

let Plugin = require('./Plugin.js').Plugin;

class fulbot {
  constructor(bot){
    this.commands = {};
    this.listeners = [];
    this.utils =  new Utils();

    this.bot = bot;
    this.utils.init(bot);
    this.plugins= [];
    this.ful = new Buffer([0xef, 0xbf, 0xbd]);

    this.loadPlugins();
  }

  loadPlugins () {
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

              let plug = require(plugName).plugin;

              let o = new plug();
              if (o instanceof Plugin) {
                that.addListener(o);
              }
            }
          }
          resolve(true);
        });
      });
    }

    Promise.all([
      load('./plugins', '/plugins/', this.addListener)/*,
      load('./commands', '/commands/', this.addCommand)*/
    ])
      .then(function(){
       /* that.bot.addListener("registered", function(message) {
          that.checkServerListeners(message);
        });
*/
        //Register main listener
        that.bot.addListener("message", function(from, to, message) {
          that.checkListeners(from, to, message);
        });
/*
        that.bot.addListener("action", function(from, to, message) {
          that.checkListeners(from, to, message);
        });

        that.bot.addListener("join", function(from, to, message) {
          that.checkCommandListeners(from, to, message);
        });*/
      });
  }

  addListener (l) {
    this.listeners.push(l);
  }

  addCommand (c) {
    this.commands[c.cmd] = c;
  }

  checkListeners (from, to, message) {

    if(!this.utils.canSpeak(to)) {
      return;
    }

    let plugins = this.listeners;
    let bot = this.bot;
    let tochan = Utils.isChanMessage(to);

    let rawmsg = new Buffer(message);

    if(buffertools.indexOf(rawmsg, this.ful) > -1 && tochan && Utils.isUserOperator(this.bot,to,this.bot.nick)) {
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

   // let route = tochan ? routes[to] : routes.priv;

   // //Exec route
   // if(!route) {
   //   return;
   // }

    plugins.forEach(function(p) {
        tochan ? p.parseMessage(message,bot, from, to) : p.parseMessage(message,bot, to, from);
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

exports.fulbot =fulbot;