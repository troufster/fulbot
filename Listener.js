"use strict";

class Listener {
  constructor(name, match, callback, channels) {
    this.n = name;
    this.m = match;
    this.cb = callback;
    this.channels = channels;
  }

  get name(){
    return this.n;
  }
  get match(){
    return this.m;
  }
  get func(){
    return this.cb;
  }
  get listen(){
    return this.channels;
  }
}

exports.Listener = Listener;


