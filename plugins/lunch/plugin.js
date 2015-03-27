"use strict";

let Plugin = require('../../lib/plugin');

class Lunch extends Plugin {

  get settings() {
    return {
      match : [/^!lunch/i],
      entry : this.eat,
      resources : true
  }}

  eat() {
    let food = this.data;
    return food[Math.floor(Math.random() * food.length)];
  }

}

module.exports = Lunch;