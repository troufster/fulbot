"use strict";

let di = require('di');
let assert = require('assert');

let Plugins = require('../lib/plugins');
let Fulbot = require('../lib/fulbot');
let MockClient = require('./mocks/client');

let botinjector = new di.Injector([MockClient]);
let bot = botinjector.get(Fulbot);

let injector = new di.Injector([]);
let plugs = injector.get(Plugins);


describe('Plugins', function() {

  it('Should resolve', function() {
    assert.ok(plugs !== undefined);
  });

  it('Should load plugins', function(done) {
    this.timeout(5000);
    plugs.load().then(() => {
      assert.ok(plugs.plugins !== undefined);
      assert.ok(Object.keys(plugs.plugins).length > 0);
      assert.ok(Object.keys(plugs.routes).length > 0);
      done();
    });
  });

  it('Should trigger plugins on message', function(done) {

    bot.connect().then(() => {
      bot.client.incomingMessage({
        from :"test",
        to : "#botdev",
        message : "!lunch"
      });
    });

    bot.client.on("sentMessage", (message) => {
      assert.ok(bot.client.messages.length > 0);
      console.log(bot.client.messages);
      done();
    });
  });
});