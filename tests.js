require('./test/dir.macro');
if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
} else {
  mocha.run();
}
