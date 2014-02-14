"use strict";
var http = require('http');




function parseYoutube(id, _cb){
  var url = 'http://gdata.youtube.com/feeds/api/videos/' + id + '?alt=json';
  //entry.title.$t
  http.get(url, function(res) {
    var data;
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
        if (data !== "Video not found") {
          var n = JSON.parse(data);
          _cb(null, n.entry.title.$t);
        }
      });
  }).on('error', function(e) {
      _cb(e, null);
    });
}


exports.parseUrl = function(message, cb){
  var _url =  message.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);

  if (!_url){return;}

  parseYoutube(_url[1], function(err, d) {
    cb(err,d);
  });
}