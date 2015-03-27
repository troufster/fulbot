"use strict";

let di = require('di');
let assert = require("assert");
var filters = require('../lib/filters');
var Filter = filters.Filter;
var FulDataFilter = filters.FulDataFilter;


let Fulbot = require('../lib/fulbot');
let MockClient = require('./mocks/client');

let botinjector = new di.Injector([MockClient]);
let bot = botinjector.get(Fulbot);


describe('Filter', function() {

  it('Should resolve', function() {
    assert.ok(filters !== undefined);
  });

  it('Fuldatafilter standalone', function() {
    var message = {
      from : "åke",
      to : "#whatever",
      message : "hello" + new Buffer([0xef, 0xbf, 0xbd]).toString()
    };

    var f = new FulDataFilter();

    var result = f.execute(message);

    assert.ok(result.action == "kick");
  });

  it('Fuldatafilter kick', function(done) {
    var message = {
      from : "åke",
      to : "#whatever",
      message : "hello" + new Buffer([0xef, 0xbf, 0xbd]).toString()
    };

    bot.connect().then(() => {
      bot.client.incomingMessage(message);
    });

    bot.client.on("sentAction", (message) => {
      assert.ok(bot.client.actions.length > 0);
      assert.ok(bot.client.actions[0].action == "kick");
      done();
    });
  });
});