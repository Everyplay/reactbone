"use strict";


var should = chai.should();
var expect = chai.expect();

// Collection
var Collection = require('../lib/collection');

describe('Collection tests', function () {
  var Foo;
  var bar;

  it('should extend collection', function () {
    Foo = Collection.extend({});
  });

  it('should created instance of collection', function () {
    bar = new Collection({}, [{id:1}, {id:2}]);
  });

  it('should record correct events when accessing collection content', function () {
    var events = [];
    bar.setEventRecorder(events);
    bar.each(function () {});
    bar.popEventRecorder();

    events[0].should.equal('add');
    events[1].should.equal('remove');
    events[2].should.equal('sort');
    events[3].should.equal('reset');
  });
});
