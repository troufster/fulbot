"use strict";
var http = require('http');


function parseYoutube(id, _cb){
  var url = 'http://www.aftonbladet.se/nyheter/article' + id + '.ab';
  //entry.title.$t
  http.get(url, function(res) {
    var data;
    var aborted = false;
    res.setEncoding('utf8');
    res
      .on('data',function(chunck){
        if(aborted )return;

        if (data === undefined) {
          data =chunck;
        } else {
          data += chunck;
        }
        var i1 = data.indexOf('meta name="description" content=');
        var i2 = data.indexOf('/>', i1 );
        if (i1> 0 &&  i2 > i1){
          _cb(null, data.substr(i1+32, i2 -i1-39 ));
          aborted=true;
        }

      });
  }).on('error', function(e) {
      _cb(e, null);
    });
}


exports.parseUrl = function(message, cb){
  var _url =  message.match(/(?:aftonbladet\.se\/nyheter\/article)(\d*)/i);

  if (!_url){return;}

  parseYoutube(_url[1], function(err, d) {
    cb(err,d);
  });
}