Function.prototype.bind = require('function-bind');
require('./test/dir.macro');
if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
} else {
  mocha.run();
}
