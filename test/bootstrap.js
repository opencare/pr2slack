'use strict';

var uuid = require('node-uuid'),
  seedrandom = require('seedrandom');

global._ = require('lodash');
global.assert = require('assert');
global.request = require('request');
global.common = require('../common');
global.factories = require('../test/factories');

var app;

before(function(done) {
  app = require('../app');
  this.timeout(5000);

  // Seed the random number generator. Print it for easy debug.
  var seed = process.env.seed || uuid.v4();
  seedrandom(seed, {
    global: true
  });
  console.log('Math.random() seed: ' + seed + '\n');
  done();
});

after(function(done) {
  if (app.server) {
    app.server.close();
  }
  done();
});
