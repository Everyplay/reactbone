"use strict";

var should = chai.should();
var expect = chai.expect();

// Model
var Model = require('../lib/model');

describe('Model tests', function () {
  var Foo;
  var bar;

  it('should extend model', function () {
    Foo = Model.extend({});
  });

  it('should created instance of model', function () {
    bar = new Foo({id: 1, foo: 'bar'});
  });

  it('should record missing field', function () {
    var fields = [];
    bar.setFieldRecorder(fields);
    bar.get('foo');
    bar.get('bar');
    bar.has('rab');
    bar.get('oof');

    var fields2 = [];
    bar.setFieldRecorder(fields2);

    bar.get('only_in_field2');
    bar.popFieldRecorder();

    fields.length.should.equal(4);
    fields[0].should.equal('foo');
    fields[1].should.equal('bar');
    fields[2].should.equal('rab');
    fields[3].should.equal('oof');

    fields2.length.should.equal(1);
    fields2[0].should.equal('only_in_field2');
  });
  it('should fetch required fields (and defer 10ms)', function (next) {
    var Bar = Model.extend({
      sync: function (method, model, options) {
        method.should.equal('read');

        var fields = options.data.fields.split(',');
        fields.length.should.equal(5);
        fields[0].should.equal('foo');
        fields[1].should.equal('bar');
        fields[2].should.equal('rab');
        fields[3].should.equal('oof');
        fields[4].should.equal('onemore');

        next();
      }
    });

    var bar = new Bar();
    var fields = [];

    bar.setFieldRecorder(fields);
    bar.get('foo');
    bar.get('bar');
    bar.has('rab');
    bar.get('oof');
    bar.popFieldRecorder();

    bar.requireFields(fields);
    bar.requireFields(['onemore']);
  });
});
