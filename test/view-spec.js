/** @jsx React.DOM */

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
    React.renderComponent(
      view,
      document.createElement('div')
    );
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
        return (
          <div>
           {this.props.collection.map(function (item) {
             return item.get('content');
           })}
          </div>
        );
      }
    });

    var collection = new Collection({}, {id: 1, content: 'content'});
    var view = new HelloCollectionView({collection: collection});
    React.renderComponent(
      view,
      document.createElement('div')
    );
  });
  it('should not fail when both component and its subviews are updated at the same time', function (done) {
    var subReady = 0;
    var mainReady = true;

    function doneIfReady(model, type) {
      if (model.get('foo')) {
        if (type === "sub") {
          subReady++;
        } else {
          mainReady = true;
        }
      }

      if (subReady === 2 && mainReady) {
        done();
      }
    }

    var SubView = View.extend({
      componentDidUpdate: function() {
        doneIfReady(this.props.model, "sub");
      },
      render: function() {
        return (
          <div>{this.props.model.get('foo')}</div>
        );
      }
    });

    var MainView = View.extend({
      componentDidUpdate: function() {
        doneIfReady(this.props.model, "main");
      },
      render: function () {
        return (
          <div>
            <SubView model={this.props.model} />
            {this.props.model.get('foo')}
            <SubView model={this.props.model} />
          </div>
        );
      }
    });

    var NextModel = Model.extend({
      type: 'next',
      isNew: function () {
        return false;
      },
      requireFields: function () {
        var self = this;
        setTimeout(function () {
          self.set('foo', true);
        }, 100);
      }
    });

    var view = MainView({model: new NextModel()});

    React.renderComponent(
      view,
      document.createElement('div')
    );
  });
});
