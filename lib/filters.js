"use strict";
let buffertools = require('buffertools');

class Filter {
  constructor(rule) {
    this.rule = rule;
  }

  execute(message) {
    let filtered = this.filter(message);

    if(filtered) {
      return {
        to : message.from,
        action : this.rule.action,
        reason : this.rule.reason,
        from : message.to,
        originalmessage : message
      }
    }
  }

  filter(message) {
    for(let data of this.rule.forbidden) {
     if(data instanceof Buffer) {
       let rawmsg = new Buffer(message.message);
       return buffertools.indexOf(rawmsg, data) > -1;
     }
    }
  }
}

class FulDataFilter extends Filter {
  constructor(){
    super({
      field : "message",
      forbidden : [new Buffer([0xef, 0xbf, 0xbd])],
      reason : "Client sending fuldata, fix your encoding ;)",
      action : "kick"
    });
  }
}

exports.Filter = Filter;
exports.FulDataFilter = FulDataFilter;