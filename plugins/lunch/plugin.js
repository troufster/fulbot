"use strict";

let Plugin = require('../../lib/plugin');

const food = [
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

class Lunch extends Plugin {
  parseMessage(message){
    return new Promise((resolve, reject) => {
      resolve({
        to: message.to,
        message : food[Math.floor(Math.random() * food.length)]
      });
    });
  }
}

module.exports = Lunch;