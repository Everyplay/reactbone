"use strict";

var should = chai.should();
var expect = chai.expect();

var React = require('react');
var _ = require('underscore');

var Model = require('../lib/model');
var Collection = require('../lib/collection');
var View = require('../lib/view');

describe('View tests', function () {
  var HelloView;
  var HelloCollectionView;

  it('should construct view instance', function () {
    var view = View();
  });
  it('should extend view', function () {
    HelloView = View.extend({
      render: function () {
        return React.DOM.div(null, "Hello ", this.props.model.get('name'));
      }
    });

    var view = HelloView();
  });
  it('should extend view extended form view', function () {
    var HelloView2 = HelloView.extend({
      render: function () {
        return React.DOM.div(null, "Hello2 ", this.props.model.get('name'));
      }
    });

    var view = HelloView2();
  });
  it('should render view', function () {
    HelloView = View.extend({
      render: function () {
        return React.DOM.div(null, "Hello ", this.props.model.get('name'));
      }
    });
    var NextModel = Model.extend({
      type: 'next'
    });
    var view = HelloView({model: new NextModel({id: 1, name: 'John'})});

    React.renderComponentToStaticMarkup(view).should.equal('<div>Hello John</div>');
  });
  it('view should require field from model when mounted', function (next) {
    var NextModel = Model.extend({
      type: 'next',
      requireFields: function (fields) {
        fields[0].should.equal('name');
        next();
      }
    });

    var view = HelloView({model: new NextModel({id: 2})});
    view.componentWillMount();
    view.render();
    view.componentDidMount();
  });
  it('view should require field from model when updated', function (next) {
    var NextModel = Model.extend({
      type: 'next',
      requireFields: _.after(2, function (fields) {
        fields[0].should.equal('name');
        next();
      })
    });

    var view = HelloView({model: new NextModel({id: 3})});
    view.componentWillMount();
    view.render();
    view.componentDidMount();
    view.componentWillUpdate();
    view.render();
    view.componentDidUpdate();
  });
  it('view should record correct events when accessing collection contents', function () {
    HelloCollectionView = View.extend({
      componentDidUpdate: function () {
        console.log("Here");
      },
      render: function () {
        return React.DOM.div(null, this.props.collection.each(function (item) {
          return React.DOM.div(null, item.get('content'));
        }));
      }
    });

    var collection = new Collection({}, {id: 1, content: 'content'});
    var view = new View({collection: collection});

    view.componentWillMount();
    view.render();
    view.componentDidMount();

  });
});
