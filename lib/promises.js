"use strict";

var whenLib = require('when');
var Exoskeleton = require('backbone');
var _ = require('underscore');
var utils = require('./utils');

var Promises = _.extend(Exoskeleton.Events, {
  when: whenLib,
  defer: whenLib.defer,
  wrap: function(opt) {
    opt = opt || {};
    var deferred = whenLib.defer();
    var promise = deferred.promise;
    var success = opt.success;
    var error = opt.error;

    opt.success = function() {
      deferred.resolve.apply(deferred, arguments);
      if (success) success.apply(this, arguments);
    };

    opt.error = function(model, err, resp) {
      err = new Error(utils.getErrorMessageFromXHR(err));
      deferred.reject(err);
      if (error) {
        error.call(this, model, err, resp);
      }
    };
    if (opt.promise) {
      opt.promise = opt.promise.yield(promise);
    } else {
      opt.promise = promise;
    }
    return opt;
  }
});

module.exports = Promises;
