"use strict";
var fs = require('fs');

var ResourceManager = function () {

  /* need to figure out what to do... */


  this.load = function (fn, _cb) {
    fs.readFile(fn, function(e, d) {
      if (e) {
        return _cb(e);
      }
      try{
        return _cb(null, JSON.parse(d.toString()));
      }
      catch(e){
        console.log(e);
        return _cb(e);
      }
      return _cb(null, null);
    });
  };

  this.save = function (fn, _cb) {

  };


  return this;
};


module.exports = {
  ResourceManager: ResourceManager
};