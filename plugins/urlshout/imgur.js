"use strict";
var https = require('https');

function parseImgur(url, _cb){
    var options = {
        hostname: 'api.imgur.com',
        port: 443,
        path: '/3/gallery/' + url, // 3 = API version
        method: 'GET',
        headers: {
            'Authorization': 'Client-ID a3239b6cb5772a1'
        }
    };

    https.get(options, function(res) {
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
                    if(n.success && n.data && n.data.title){
                        _cb(null, n.data.title);
                    }
                }
            });
    }).on('error', function(e) {
        _cb(e, null);
    });
}

exports.parseUrl = function(message, cb){

    if(!message.match(/(?:imgur\.com\/)/i)){
        return;
    }

    // http://imgur.com/gallery/w1CJq
    var gallery = message.match(/(?:imgur\.com\/gallery\/)(\w+)/i);
    // http://imgur.com/r/gifs/rf50wsJ
    var subreddit = message.match(/(?:imgur\.com\/)(r\/\w+\/\w+)/i);

    var _url;
    if(gallery){
        _url = "album/" + gallery[1];
    }
    else if(subreddit){
        _url = subreddit[1];
    }

    // http://i.imgur.com/cVnv9LI.jpg
    // http://imgur.com/WCnCSNh
    //
    // no way to get the title or description from these.
    // there is an endpoint (https://api.imgur.com/3/image/cVnv9LI)
    // but both title and description are always empty

    if(!_url){
        return;
    }

    parseImgur(_url, function(err, d) {
        cb(err,d);
    });
};