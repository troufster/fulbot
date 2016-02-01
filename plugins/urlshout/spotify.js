"use strict";
var http = require('https');



function parseSpotify(part, id, _cb){

  //var url = 'http://ws.spotify.com/lookup/1/.json?uri=' + uri;

  var url = 'https://api.spotify.com/v1/' + part + 's/' + id;


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
        if (part === "album"){
          _cb(null, n.name + " - " + n.artists[0].name );
        } else if (part === "artist") {
          _cb(null, n.name );
        } else {
          _cb(null, n.name + " - " + n.artists[0].name );
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
  var c = null;
  var id = null;


  if (url.indexOf('open.spotify.com') > -1 ) {
    //http://open.spotify.com/track/66yFvHn4fQRMic2e2uljTJ
    var r = url.split('/');
    if (r[r.length-2] === "track" || r[r.length-2] === "artist" || r[r.length-2] === "album") {
      c = r[r.length-2] ;
      id = r[r.length-1] ;
    }
  } else if (url.match(/spotify:(track|album|artist):([a-zA-Z0-9]{22})/i)) {
    //spotify:track:66yFvHn4fQRMic2e2uljTJ
    var t = url.split(':');
    c = t[1] ;
    id = t[2] ;
  }

  if (c !== null && id !== null) {
    parseSpotify(c,id, function(err, d) {
      cb(err,d);
    });
  }
}
