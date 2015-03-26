"use strict";
var
  http = require('http'),
  parseString = require('xml2js').parseString,
  fs = require('fs'),
  EventEmitter = require('events').EventEmitter;


var buertzList = "./resources/buertz/";
var xmlUrl = "http://www.systembolaget.se/Assortment.aspx?butiknr=0504";

function Admin(){
  this.emitter = new EventEmitter();

  this.write = function(cb){
    //uncomment statement below if you want all the categories.
    /*
    for(var key in this.jsonBeer) {
      this.writeFile(key, JSON.stringify(this.jsonBeer[key]),cb);
    }
    */
    cb(null,'saving Öl, ' + this.jsonBeer["Öl"].length + ' articles.');
    this.writeFile("Öl", JSON.stringify(this.jsonBeer["Öl"]),cb);

  };

  this.writeFile = function(name, data, cb){
    var filename = buertzList + name + '.txt';
    var that = this;

    fs.exists(buertzList, function(exists){
      if (!exists) {
      fs.mkdir(buertzList);
      }
      fs.open(filename, 'w', 666, function(err, fd) {
      if(err) {
        throw err;
      }

      fs.write(fd,  data, null, undefined, function(err, written) {
        fs.close(fd, function(){
        cb(null, name + ' saved, ' + written + ' bytes written');
        that.on({ Type: 'refreshed', Message : '' });
        });
      });
      });
    });
  };

  this.groupBy = function(array, predicate) {
    var grouped = {};
    for(var i = array.length-1; i >=0 ; i--) {
      var groupKey = predicate(array[i]);
      if (typeof(grouped[groupKey]) === "undefined"){
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(array[i]);
    }
    return grouped;
  };

  this.on = function(event) {
    this.emitter.emit(event.Type, event);
  };

}

Admin.prototype.refresh = function(cb){
  var that = this;
  http.get(xmlUrl, function(res) {
    var data;
    cb(null, "Got response: " + res.statusCode);
    res.setEncoding('utf8');
    res
      .on('data',function(chunck){
        if (data === undefined) {
          data =chunck;
        } else {
          data += chunck;
        }
    })
      .on('end',function(){
        cb(null,"received all data, processing");
        parseString(data, function (err, result) {
          cb(null,"data parsed");
          that.jsonBeer = that.groupBy(result.artiklar.artikel, function (obj) {
            if (obj.Varugrupp === undefined || obj.Varugrupp.length === 0) {
              return "unknown";
            }

            var name = obj.Varugrupp[0];
            if (name.indexOf(',') > -1 ) {
              return name.substring(0, name.indexOf(','));
            }
            return name;
          });
        });
        cb(null,"data grouped");
        that.write(cb);
      });
  }).on('error', function(e) {
    cb(null, "Got error: " + e.message);
  });
};

module.exports = Admin;