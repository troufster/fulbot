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
        if (data !== "Video not found") {
          var n = JSON.parse(data);

          var game = n[id].data;

          var text = game.name + ' --> '+ game.price_overview.currency + ' ' + game.price_overview.final/100;

          if (game.price_overview.discount_percent > 0)
          {
            text += ' (- ' + game.price_overview.discount_percent + ' %)';

          }

          _cb(null,  text);
        }
      });
  }).on('error', function(e) {
    _cb(e, null);
  });
}


exports.parseUrl = function(message, cb){
  var i = message.indexOf('store.steampowered.com/app/');
  if (i === 0){return;}

  var id = message.substr(i+27);
  id = id.replace('/','');

  parseSteam(id, function(err, d) {
    cb(err,d);
  });
}