"use strict";
let listener = require('../listeners.js').Listener;


class Plugin extends listener{
  constructor(){
    this.foodzors = [
      "chang-thai!!!",
      "kebabhouse",
      "charken",
      "gula huset",
      "NH",
      "cupolenburgare",
      "tacobar",
      "cloetta center",
      "marcus pizzeria",
      "texas",
      "konsert & kongress",
      "hagdahls",
      "ghingis",
      "matkällaren"
    ];

    this.listeners = [{
      name : '!foodzor randomizer',
      match : /\!lunch/i,
      func : sayFood,
      listen : ["#sogeti", "priv"]
    }];
  }

  sayFood(bot, from, to, message) {
    bot.say(to, foodzors[Math.floor(Math.random() * foodzors.length)]);
  }
}

exports.plugin = Plugin;
