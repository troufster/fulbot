"use strict";
var http = require('http');



function parseSpotify(uri, _cb){

  var url = 'http://ws.spotify.com/lookup/1/.json?uri=' + uri;

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
        if (data === undefined) {return;}
        var n = JSON.parse(data);
        if (n.album !== undefined){
          _cb(null, n.album.name + " - " + n.album.artist );
        } else if (n.track === undefined) {
          _cb(null, n.artist.name );
        } else {
          _cb(null, n.track.name + " - " + n.track.artists[0].name );
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
  var uri = null;

  if (url.indexOf('open.spotify.com') > -1 ) {
    //http://open.spotify.com/track/66yFvHn4fQRMic2e2uljTJ
    var r = url.split('/');
    if (r[r.length-2] == "track" || r[r.length-2] == "artist" || r[r.length-2] == "album") {
      uri = "spotify:" +  r[r.length-2] + ":" + r[r.length-1] ;
    }
  } else if (url.match(/spotify:(track|album|artist):([a-zA-Z0-9]{22})/i)) {
    //spotify:track:66yFvHn4fQRMic2e2uljTJ
    uri = url;
  }

  if (uri !== null) {
    parseSpotify(uri, function(err, d) {
      cb(err,d);
    });
  }
}
