"use strict";

var _ = require('underscore');
var React = require('react');
var Events = require('backbone').Events;

var Model =  require('./model');
var Collection = require('./collection');

var ReactboneMixin = _.extend({
  _addCollectionListener: function (collection) {
    this.listenTo(collection, 'all', function (event) {
      if (this.isMounted()
      && this['_' + collection.cid + '_events'].indexOf(event) > -1) {
        this.deferredForceUpdate();
      }
    });
  },
  _addCollectionListeners: function () {
    var self = this;
    _.forEach(this.collections, _.bind(this._addCollectionListener, this));
  },
  _listenToModel: function (model) {
    this.listenTo(model, 'all', function (event) {
      if (event === 'change' &&
      this['_' + model.cid + '_fields'] &&
      this['_' + model.cid + '_fields'].length > 0) {
        if (model.changedAttributes(this['_' + model.cid + '_fields'])) {
          if (this.isMounted()) {
            this.deferredForceUpdate();
          }
        }
      } else {
        if (this.isMounted()
        && this['_' + model.cid + '_events'].indexOf(event) > -1) {
          this.deferredForceUpdate();
        }
      }
    });
  },
  _addModelListeners: function () {
    var self = this;
    _.forEach(this.models, _.bind(this._listenToModel, this));
  },
  _setFieldRecorderForModel: function (model) {
    var fields = this['_' + model.cid + '_fields'] || [];
    this['_' + model.cid + '_fields'] = fields;
    model.setFieldRecorder(fields, this.rid);

    var events = this['_' + model.cid + '_events'] || [];
    this['_' + model.cid + '_events'] = events;
    model.setEventRecorder(events, this.rid);
  },
  _setEventRecorderForCollection: function (collection) {
    var events = this['_' + collection.cid + '_events'] || [];
    this['_' + collection.cid + '_events'] = events;
    collection.setEventRecorder(events, this.rid);
  },
  _setFieldRecorders: function () {
    _.forEach(this.models, _.bind(this._setFieldRecorderForModel, this));
    _.forEach(this.collections, _.bind(this._setEventRecorderForCollection, this));
  },
  _fetchRequiredFieldsForModel: function (model) {
    model.popFieldRecorder();
    if (!model.isNew()) {
      model.requireFields(this['_' + model.cid + '_fields'] || []);
    }
  },
  _fetchRequiredFields: function () {
    _.forEach(this.models, _.bind(this._fetchRequiredFieldsForModel, this));
  },
  _listenToRequiredCollectionEvents: function () {
    _.forEach(this.collections, function (collection) {
      collection.popEventRecorder();
    });
  },
  deferredForceUpdate: function () {
    var self = this;

    // Avoid updating if already dirty and deferred call to forceRender invoked
    if (this._dirty) {
      return;
    }
    this._dirty = true;

    _.defer(function () {
      if (self.isMounted() && self._dirty) {
        self.forceUpdate();
      }
    });
  },
  componentWillMount: function () {
    _.extend(this, Events);
    this.processModelsAndCollection(this.props);
  },
  componentWillUpdate: function () {
    this._setFieldRecorders();
  },
  componentDidMount: function () {
    this._fetchRequiredFields();
    this._listenToRequiredCollectionEvents();
  },
  componentDidUpdate: function () {
    this._dirty = false;
    this._fetchRequiredFields();
    this._listenToRequiredCollectionEvents();
  },
  componentWillUnmount: function () {
    this.releaseModelsAndCollections();
    this.stopListening();
  },
  componentWillReceiveProps: function (nextProps) {
    this.processModelsAndCollection(nextProps);
  },
  processModelsAndCollection: function (props) {
    var self = this;
    this.releaseModelsAndCollections();
    this.models = [];
    this.collections = [];
    _.forEach(props, function (item) {
      if (item instanceof Model) {
        self.models.push(item);
      } else if (item instanceof Collection) {
        self.collections.push(item);
      }
    });

    this._setFieldRecorders();
    this._addCollectionListeners();
    this._addModelListeners();
  },
  releaseModelsAndCollections: function () {
    var self = this;
    if (this.models) {
      _.forEach(this.models, function (model) {
        self.stopListening(model);
      });
    }
    if (this.collections) {
      _.forEach(this.collections, function (collection) {
        self.stopListening(collection);
      });
    }
  }
});

var spec = {
  mixins: [ReactboneMixin],
  render: function () {},
  // Only render when new props or state is different from the old
  // This brings considerable performance boost.
  // PS. This is not in the mixin as shouldComponentUpdate can only be provided once
  shouldComponentUpdate: function(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) ||
           !_.isEqual(this.state, nextState);
  }
};

var ReactClass = React.createClass(spec);

function createConstructor(ReactClass) {
  return function () {
    return ReactClass.apply(null, arguments);
  };
}

var View = createConstructor(ReactClass);

View.spec = spec;
View.mixin = ReactboneMixin;

View.extend = function (spec) {
  if (spec.mixins) {
    spec.mixins = _.union(this.spec.mixins, spec.mixins);
  }

  var extendedSpec = _.extend({}, this.spec, spec, {__super__: this.spec});
  var ReactClass = React.createClass(extendedSpec);
  var constructor = createConstructor(ReactClass);

  constructor.extend = this.extend;
  constructor.spec = extendedSpec;
  constructor.addons = this.addons;
  constructor.__super__ = this.spec;

  return constructor;
};

module.exports = View;
