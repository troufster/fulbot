"use strict";
var fs = require('fs');



var ResourceManager = function(){
  var resourcePath = './resources/';

  function writeFile(filename, data, _cb) {
    fs.open(filename, 'w', 666, function(err, d) {
      if(err) {
        _cb(err);
      }

      return fs.write(d, data, null, undefined, function(err, written) {
        if(err) {
          _cb(err);
        }

        fs.close(d,function(){
          _cb(null, written);
        });

      });
    });
  }

  function readFileJSON(filename, _cb) {
    fs.readFile(filename, function(e, d) {
      if (e) {
        _cb(null);
      }
      try{
        _cb(null, JSON.parse(d.toString()));
      }
      catch(e){
        _cb(null);
      }
    });
  }

  /* privates */
  this.load = function (plugin, fn, _cb) {
    var path = resourcePath + plugin;
    var filename = path + '/' + fn;

    fs.stat(path, function(err,stats){
      if (!stats){
        fs.mkdir(path, function(err){
          if (err){
            console.log(err);
          }
        });
      }
    });

    readFileJSON(filename, _cb);
  };

  this.save = function(plugin,fn, data, _cb) {
    var path = resourcePath + plugin;
    var filename = path + '/' + fn;


      fs.stat(path, function(err,stats){
          if (!stats){
              fs.mkdir(path, function(err){
                  if (err){
                      console.log(err);
                  }
              });
          }
      });

    writeFile(filename, JSON.stringify(data), _cb);
  };

  return this;
};

module.exports.mixin = function(destination) {
  ResourceManager.call(destination.prototype);
};