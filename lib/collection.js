"use strict";

var Collection = require('backbone').Collection;
var Model = require('./model');
var _ = require('underscore');
var Promises = require('./promises');
var when = require('when');

var ReactboneCollection = Collection.extend({
  model: Model,
  constructor: function(items, options) {
    this.cid = _.uniqueId('r');
    this._event_recorders = [];
    this._model_pool = [];
    Collection.apply(this, arguments);
    this.on('invalid', this.handleInvalidModel);
  },
  setEventRecorder: function (frArray) {
    this._event_recorders.push(frArray);
  },
  popEventRecorder: function () {
    return this._event_recorders.pop();
  },
  addAttributeToEventRecorder: function (attribute) {
    var recorder = this._event_recorders[this._event_recorders.length - 1];
    if (recorder && recorder.indexOf(attribute) === -1) {
      recorder.push(attribute);
    }
  },
  _addBasicEventRecorders: function () {
    this.addAttributeToEventRecorder('add');
    this.addAttributeToEventRecorder('remove');
    this.addAttributeToEventRecorder('sort');
    this.addAttributeToEventRecorder('reset');
  },
  create: function(model, options) {
    options = options ? _.clone(options) : {};
    if (!(model = this._prepareModel(model, options))) {
      return when.reject(this.validationError);
    }
    if (!options.wait) this.add(model, options);
    var collection = this;
    var promise = model.save(null, options);
    promise.done(function() {
      if (options.wait) collection.add(model, options);
    }, function(err) {
      if (!options.wait) collection.remove(model);
      return err;
    });
    return promise;
  },
  fetch: function(options) {
    options = Promises.wrap(options);
    ReactboneCollection.__super__.fetch.call(this, options);
    return options.promise;
  },
  handleInvalidModel: function(collection, validationError, options) {
    this.validationError = validationError;
  }
});

var methods = ['at', 'get', 'pluck', 'where', 'slice', 'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

 _.each(methods, function(method) {
  ReactboneCollection.prototype[method] = function() {
    this._addBasicEventRecorders();
    return ReactboneCollection.__super__[method].apply(this, arguments);
  };
});



module.exports = ReactboneCollection;
