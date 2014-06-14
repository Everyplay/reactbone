"use strict";

var _ = require('underscore');
var Backbone = require('backbone');

var Reactbone = {};

Reactbone.Model = require('./lib/model');
Reactbone.Collection = require('./lib/collection');
Reactbone.View = require('./lib/view');

module.exports = Reactbone;

// This will be removed when sear get proper (window/amd) expose functionality
if (typeof window !== 'undefined') {
  window.Reactbone = Reactbone;
  window._ = _;
  window.Backbone = Backbone;
}
