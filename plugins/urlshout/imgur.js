"use strict";
var http = require('http');

function parseImgur(id, _cb){
    var url = 'http://api.imgur.com/oembed.json?url=http://imgur.com/gallery/' + id;
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
                if (data) {
                    var n = JSON.parse(data);
                    if(n.success){
                        _cb(null, n.title);
                    }
                }
            });
    }).on('error', function(e) {
        _cb(e, null);
    });
}

exports.parseUrl = function(message, cb){
    var _url = message.match(/(?:imgur\.com\/gallery\/)(\w+)/i);

    if (!_url){return;}

    parseImgur(_url[1], function(err, d) {
        cb(err,d);
    });
}