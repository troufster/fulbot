"use strict";

let di = require('di');

let Fulbot = require('../../lib/fulbot');
let Plugin = require('../../lib/plugin');


class Quote extends Plugin {

  get settings() {
    return {
      match : [/^!quote/i],
      entry : this.quoteMain,
      resources : true
    }}

  get data() {
    return this.db('quotes');
  }


  write(quote) {
    if(quote.length < 2) {
      return "Nope";
    }

    let length = this.data.keys().length;

    var q = {
      points : 0,
      text : quote,
      id : length,
      subject : "Quote #" + length
    };

    this.data.push(q);
    this.db.save();

    return "Quote #" + length + " added";
  }

  quoteMain(message) {
    let parts = message.split(" ");
    let command = parts[1];
    let rest = parts.slice(2,parts.length).join(" ");

    if(command !== undefined && command.indexOf("#") !== -1) {
      let n = command.replace('#', '');
      /*
      row(n, function(e,d) {
        if(e) return;
        bot.say(to, d);
      });*/

    }

    switch(command) {
      case "add":
        return this.write(rest);
        break;
    }
  }

}

module.exports = Quote;