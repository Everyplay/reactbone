init:
	npm install
	bower install

testunit:
	./node_modules/.bin/jsxhint test/
	./node_modules/.bin/sear test test/

teststyling:
	./node_modules/.bin/jsxhint lib/
	./node_modules/.bin/jsxcs lib/

testall: testunit teststyling

build: testall
	./node_modules/.bin/sear build --name reactbone --minify true --target dist/

clean:
	rm -rf dist/
	rm -rf bower_components/
	rm -rf node_modules/
	
coveralls:
	./node_modules/.bin/sear test test/ --cov -R node_modules/mocha-lcov-reporter/lib/lcov.js | COVERALLS_SERVICE_NAME="travis-ci" ./node_modules/coveralls/bin/coveralls.js
