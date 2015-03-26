"use strict";
let listener = require('../Listener.js').Listener;
let plugin = require('../Plugin.js').Plugin;


class lunch extends plugin{
  constructor(){
    super();
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

    this.listeners = [new listener('!foodzor randomizer',/!lunch/i,this.sayFood,["#sogeti", "priv"])];

  }

  sayFood(bot, from, to, message) {
    bot.say(to, this.foodzors[Math.floor(Math.random() * this.foodzors.length)]);
  }
}

exports.plugin = lunch;
