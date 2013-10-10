"use strict";
var fs = require('fs');

var ResourceManager = function () {

  var resourcePath = './resources/';

  /* privates */

  function writeFile(filename, data, _cb) {
    fs.open(filename, 'w', 666, function(err, d) {
      if(err) {
        return _cb(err);
      }

      return fs.write(d, data, null, undefined, function(err, written) {
        if(err) {
          return _cb(err);
        }

        fs.close(d,function(){
          return _cb(null, written);
        });

      });
    });
  }

  function readFileJSON(filename, _cb) {
    fs.readFile(filename, function(e, d) {
      if (e) {
        _cb(e);
      }
      try{
        _cb(null, JSON.parse(d.toString()));
      }
      catch(e){
       _cb(e);
      }
    });
  }

  this.load = function (plugin, fn, _cb) {
    var path = resourcePath + plugin;
    var filename = path + '/' + fn;

    fs.exists(path, function(exists){
      if (!exists){
        fs.mkdir(path, function(){
          _cb(null,{});
        });
      } else{
        readFileJSON(filename, _cb);
      }
    });
  };

  this.save = function(plugin,fn, data, _cb) {
    var path = resourcePath + plugin;
    var filename = path + '/' + fn;
    fs.exists(path, function(exists){
      if (!exists){
        fs.mkdir(path, function(){
          writeFile(filename, JSON.stringify(data), _cb);
        });
      } else{
        writeFile(filename, JSON.stringify(data), _cb);
      }
    });
  };

  return this;
};


module.exports = {
  ResourceManager: ResourceManager
};