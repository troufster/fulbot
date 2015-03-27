"use strict";

var low = require('lowdb');
var di = require('di');
const db = "data.json";

class Resources {
  constructor(file) {
    if(!this.settings.resources) return;
    this.db = low(file + db);
  }

  get data() {
    return this.db.object;
  }
}

di.annotate(Resources, new di.Provide(Resources));

module.exports = Resources;