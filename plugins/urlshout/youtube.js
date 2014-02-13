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
  /* /(?:(?:(?:https?:\/\/)|(?:www\.))(?:(?:[-\w/_\.]*(?:\?\S+))))|(?:spotify:(?:track|album|artist):(?:[a-zA-Z0-9]{22}))/i*/
  var _url =  message.match(/((https?:\/\/)|(www\.))(([-\w/_\.]*(\?\S+)?)?)?|(spotify:(track|album|artist):([a-zA-Z0-9]{22}))/i);

  if (_url === null){return;}

  var url = _url[0];

  var ua = Object.keys(bot.chans[to].users);
  if (url.match(/(https?:\/\/)?(www\.)?youtube\.com\/watch\?v/)){
    var youtube_id = url.match(/\?v=([\w-]{11})/);

    if (youtube_id === null){
      return;
    }
    parseYoutube(youtube_id[1], function(err, d) {
      out(err,d,bot,ua);
    });
  }
}