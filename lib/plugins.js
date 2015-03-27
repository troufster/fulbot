"use strict";

let di = require('di');
let requireDir = require('require-dir');

var EventEmitter = require('events');
let Configuration = require('./conf');

let injector = new di.Injector([]);
let conf = injector.get(Configuration);

function* objectIterator(obj) {
  for (let key of Object.keys(obj)) {
    yield {
      name:key,
      contents:obj[key]
    };
  }
}

class Plugins extends EventEmitter {
  constructor() {
    this.plugins = {};
    this.routes = {};
  }

  listenTo(emitter) {
    var that = this;
    emitter.on("message", (message) => {
      that.route(message);
    })
  }

  route(message) {
    let that = this;
    let receivers = this.routes[message.to];

    Promise.all(
        receivers.map((r) => {
          return new Promise((resolve, reject) =>{
          resolve(r.parseMessage(message))
        });
      }))
      .then((response) => {
        that.emit('response', response);
      })
  }

  load() {
    let that = this;
    return new Promise((resolve, reject) => {
      let dir = requireDir('../plugins', { recurse: true});

      try{
        for(let required of objectIterator(dir)) {

          var location = __dirname + "/../" + conf.pluginslocation + required.name + "/";

          //Instantiate plugin with config file
          var p = new required.contents.plugin(required.contents.config, location);
          let plugin = that.plugins[required.name] = p;

          for(let chan of plugin.config.listen) {

            if(!that.routes[chan]) {
              that.routes[chan] = [];
            }

            that.routes[chan].push(plugin);
          }
        }

        resolve();
      } catch(e) {
        return reject(e);
      }
    });
  }
}

di.annotate(Plugins, new di.Provide(Plugins));

module.exports = Plugins;