"use strict";

var Model = require('backbone').Model;
var _ = require('underscore');
var Promises = require('./promises');

var ReactboneModel = module.exports = Model.extend({
  constructor: function (attributes, options) {
    ReactboneModel.__super__.constructor.call(this, attributes, options);
    this._loadingFields = [];
    this._requiredFields = [];
    this._field_recorders = [];
    this._event_recorders = [];
    this._model_relations = {};
  },
  save: function (key, val, options) {
    var opt, self = this;
    if (!options && (typeof val === "object" || typeof val === "undefined")) {
      opt = val = Promises.wrap(val);
    } else {
      opt = options = Promises.wrap(options);
    }
    var validated = ReactboneModel.__super__.save.call(this, key, val, options);
    if (validated === false) {
      opt.error.call(this, this, this.validationError || new Error('validation failed'));
    }
    return opt.promise;
  },
  fetch: function (options) {
    options = Promises.wrap(options);
    ReactboneModel.__super__.fetch.call(this, options);
    return options.promise;
  },
  destroy: function (options) {
    options = Promises.wrap(options);
    ReactboneModel.__super__.destroy.call(this, options);
    return options.promise;
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
  setFieldRecorder: function (frArray) {
    this._field_recorders.push(frArray);
  },
  popFieldRecorder: function () {
    this._field_recorders.pop();
  },
  addAttributeToFieldRecorder: function (attribute) {
    var recorder = this._field_recorders[this._field_recorders.length - 1];
    if (recorder && recorder.indexOf(attribute) === -1) {
      recorder.push(attribute);
    }
  },
  get: function (attribute, dontAdd) {
    if (!dontAdd) {
      this.addAttributeToFieldRecorder(attribute);
    }

    return ReactboneModel.__super__.get.call(this, attribute);
  },
  has: function (attribute, dontAdd) {
    return this.get(attribute, dontAdd) != null;
  },
  _constructRequestParams: function (fields) {
    return {
      fields: fields.join(',')
    };
  },
  _loadRequiredFields: function () {
    var self = this;
    var fields = this._requiredFields;
    this._requiredFields = [];
    fields = _.difference(fields, _.keys(this.toJSON()));
    fields = _.difference(fields, this._loadingFields);
    fields = _.difference(fields, this._loadedFields);

    if (fields.length > 0) {
      this._loadingFields = _.union(this._loadingFields, fields);

      this.fetch({
        data: self._constructRequestParams(fields)
      }).done(function () {
        self._loadingFields = _.difference(self._loadingFields, fields);
        self._loadedFields = _.union(self._loadedFields, fields);
      }, function () {
        self._loadingFields = _.difference(self._loadingFields, fields);
        self._loadedFields = _.union(self._loadedFields, fields);
      });
    }
  },
  requireFields: function (fields) {
    this._requiredFields = _.union(this._requiredFields, fields);
    clearTimeout(this._loadRequiredTimeout);
    var self = this;
    this._loadRequiredTimeout = setTimeout(function () {
      self._loadRequiredFields();
    }, 10);
  }
});
