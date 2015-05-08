"use strict";
var http = require('http');
var conf = require("../../conf");



function parseSteam(id, _cb){
  var url = 'http://store.steampowered.com/api/appdetails/?appids=' + id;

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
        if (this.statusCode === 200) {
          var n = JSON.parse(data);
          if (!n[id].success ) {return;}

          var game = n[id].data;

          var text = game.name + ' --> ';
          if (!game.is_free) {
            text += game.price_overview.currency + ' ' + game.price_overview.final/100;
            if (game.price_overview.discount_percent > 0) {
              text += ' (- ' + game.price_overview.discount_percent + ' %)';
            }
          } else{
            text += ' free to play';
          }

          _cb(null,  text);
        }
      });
  }).on('error', function(e) {
    _cb(e, null);
  });
}


exports.parseUrl = function(message, cb){
  var _url = message.match(/:?store\.steampowered\.com\/app\/(\d+)\/?/);
  if (!_url){return;}

  parseSteam(_url[1], function(err, d) {
    cb(err,d);
  });
}