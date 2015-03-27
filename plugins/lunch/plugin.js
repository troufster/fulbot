"use strict";

let Plugin = require('../../lib/plugin');

class Lunch extends Plugin {

  get match() { return [/^!lunch/i]; }
  get entry() { return this.eat;}

  eat() {
    var food = this.data;
    return food[Math.floor(Math.random() * food.length)];
  }

}

module.exports = Lunch;