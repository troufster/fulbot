"use strict";

var resfile = 'reposts.json';
var configMixin = require('../../resourceManager.js').mixin;

var express = require('express');

var app = express();

function RepostStore() {}

configMixin(RepostStore);

var r = new RepostStore();
var data;

r.load('reposts', resfile, function(e, d) {
  if (e) {
    throw e;
  }

  data = d;
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Reposts', urls: Object.keys(data._urls).reverse(), data: data});
});

var server = app.listen(14140, function(){
  var host = server.address().address;
  var port = server.address().port;

  console.log('Repostweb listening at http://%s:%s', host, port);
});