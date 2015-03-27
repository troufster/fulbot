"use strict";

class Utils {
  static isChanMessage(to) {
     return !!(to.match(/^[#&]/));
  }

  static flipToFrom(message) {
    var ret = [];

    for(let m of message) {
      ret.push({
        from : m.to,
        to : m.from,
        message : m.message
      })
    }

    return ret;
  }
}

module.exports = Utils;
