"use strict";
let fs = require('fs');
const resourcePath = './resources/';

class ResourceManager {
  constructor(){

  }


  load (plugin, fn, _cb) {
    let path = resourcePath + plugin;
    let filename = path + '/' + fn;

    fs.stat(path, function(err,stats){
      if (!stats){
        fs.mkdir(path, function(err){
          if (err){
            console.log(err);
          }
        });
      }
    });

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

  save (plugin,fn, data, _cb) {
    let path = resourcePath + plugin;
    let filename = path + '/' + fn;


      fs.stat(path, function(err,stats){
          if (!stats){
              fs.mkdir(path, function(err){
                  if (err){
                      console.log(err);
                  }
              });
          }
      });

    fs.open(filename, 'w', 666, function(err, d) {
      if(err) {
        _cb(err);
      }

      return fs.write(d, JSON.stringify(data), null, undefined, function(err, written) {
        if(err) {
          _cb(err);
        }

        fs.close(d,function(){
          _cb(null, written);
        });

      });
    });
  }

}

exports.ResourceManager = ResourceManager;