"use strict";
var https = require('https');
var conf = require("../../conf");



function parseYoutube(id, _cb){
  var url = 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=' + conf.youtubeAPIKey + '&fields=items(snippet(title))&part=snippet';

  /*response:
   {
    "items": [{
      "snippet": {
        "title": "The milkshakes are so thick [Extended Clip]"
      }
    }]
   }
  */
  //entry.title.$t
  https.get(url, function(res) {
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
          _cb(null, n.items[0].snippet.title);
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