"use strict";

let di = require('di');
let assert = require("assert");
let Configuration = require('../lib/conf');

let injector = new di.Injector([]);
let conf = injector.get(Configuration);

describe('Configuration', function() {
  it('Should resolve', function() {
    assert.ok(conf !== undefined);
  });

  it('Should load configuration', function() {
    assert.ok(conf.client !== undefined);
    assert.ok(conf.client.port !== undefined);
  });
});
