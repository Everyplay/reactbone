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
	./node_modules/.bin/sear build --name reactbone --minify true --target dist/ --includes sear-require

clean:
	rm -rf dist/
	rm -rf bower_components/
	rm -rf node_modules/
