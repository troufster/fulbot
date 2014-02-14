"use strict";
var http = require('http');


var subscribers = [];





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




function parseUrl(bot, from, to, message){
  /* /(?:(?:(?:https?:\/\/)|(?:www\.))(?:(?:[-\w/_\.]*(?:\?\S+))))|(?:spotify:(?:track|album|artist):(?:[a-zA-Z0-9]{22}))/i*/
  var _url =  message.match(/((https?:\/\/)|(www\.))(([-\w/_\.]*(\?\S+)?)?)?|(spotify:(track|album|artist):([a-zA-Z0-9]{22}))/i);

  if (_url === null){return;}

  var url = _url[0];

  var ua = Object.keys(bot.chans[to].users);
  if (url.match(/(https?:\/\/)?(www\.)?youtube\.com\/watch\?v/)){
    var youtube_id = url.match(/\?v=([\w-]{11})/);

    parseYoutube(youtube_id[1], function(err, d) {
      out(err,d,bot,ua);
    });

  } else if (url.indexOf('open.spotify.com') > -1 ) {
    //http://open.spotify.com/track/66yFvHn4fQRMic2e2uljTJ
    var r = url.split('/');
    if (r[r.length-2] == "track" || r[r.length-2] == "artist" || r[r.length-2] == "album") {
      var uri = "spotify:" +  r[r.length-2] + ":" + r[r.length-1] ;

      parseSpotify(uri, function(err, d) {
        out(err,d,bot,ua);
      });
    }

  } else if (url.match(/spotify:(track|album|artist):([a-zA-Z0-9]{22})/i)) {  /**/
    //spotify:track:66yFvHn4fQRMic2e2uljTJ

      parseSpotify(url, function(err, d) {
        out(err,d,bot,ua);
      });
  }

}

function out(err,d,bot,ua){
  if(err)return;
  for(var i = subscribers.length-1;i >= 0;i--){
    if (ua.indexOf(subscribers[i]) > -1){
      bot.notice(subscribers[i],d);
    }
  }
}

function subscribeUser(bot, from, to, message){
  if (subscribers.indexOf(from) === -1){
    subscribers.push(from);
  }
}

function unsubscribeUser(bot, from, to, message){
  var index = subscribers.indexOf(from);
  if (index > -1){
    subscribers.splice(index,1);
  }
}

exports.listeners = function(){
  return [{
    name : 'Url Parser',
    match : /((https?:\/\/)|(www\.))(([-\w/_\.]*(\?\S+)?)?)?|(spotify:(track|album|artist):([a-zA-Z0-9]{22}))/i,
    func : parseUrl,
    listen : ["#botdev","#sogeti"]
  },
    {
    name: 'Url - subscribe',
    match: /^!urlreg*/,
    func: subscribeUser,
    listen: ["#botdev","#sogeti", "priv"]
  },
    {
      name: 'Url - unsubscribe',
      match: /^!urlunreg*/,
      func: unsubscribeUser,
      listen: ["#botdev","#sogeti", "priv"]
    }];
};
