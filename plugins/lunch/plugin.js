"use strict";

let Plugin = require('../../lib/plugin');

class Lunch extends Plugin {

  parseMessage(message){
    var food = this.data;

    return new Promise((resolve, reject) => {
      resolve({
        to: message.to,
        message : food[Math.floor(Math.random() * food.length)]
      });
    });
  }
}

module.exports = Lunch;