"use strict";

var resfile = 'reposts.json';
var configMixin = require('../../resourceManager.js').mixin;

var express = require('express');

var app = express();

function RepostStore() {}

configMixin(RepostStore);

var r = new RepostStore();
var data;
var urls;

function load() {
  r.load('reposts', resfile, function(e, d) {
    if (e) {
      throw e;
    }

    data = d;
    urls = Object.keys(data._urls);
  });
}

load();

setInterval(function () {
  load();
}, 100000);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {

  var urlz = Array.prototype.slice.call(urls);

  res.render('index', { title: 'Reposts', urls: urlz.reverse(), data: data});
});

app.get('/repost/:id', function(req,res) {

  var id = req.params.id;

  if(!id) {
    return;
  }

  var key = urls[id];

  if(!key) {
    return;
  }

  var repost = data._urls[key];

  if(!repost) {
    return;
  }

  res.render('repost', { repost: repost, url : key, id : id});
});

var server = app.listen(14140, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Repostweb listening at http://%s:%s', host, port);
});