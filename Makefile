init:
	npm install
	bower install

testunit:
	./node_modules/.bin/jsxhint test/
	./node_modules/.bin/baker build --target test_build/ --input . --index index.html --minify false --name tests --includes es5-shim,mocha,bower_components/chai/chai,baker-require
	./node_modules/.bin/mocha-phantomjs test_build/index.html

teststyling:
	./node_modules/.bin/jsxhint lib/
	./node_modules/.bin/jsxcs lib/

testall: testunit teststyling

build: testall
	./node_modules/.bin/baker build --target dist/

clean:
	rm -rf dist/
	rm -rf bower_components/
	rm -rf node_modules/
