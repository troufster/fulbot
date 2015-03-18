"use strict";

var express = require('express'),
    quote = require('./routes/quote'),
    http = require('http'),
    crypto = require('crypto'),
    path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 15150);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', quote.get);
app.get('/:id', quote.getid);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


