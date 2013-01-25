SRC = app.js app.json index.html openlayers-mobile.js GeolocateControl.js
SRC_APP = $(shell find app -name \*.js)

.PHONY: all
all: app

.PHONY: ios
ios: app
	cp -r build/App/production/* build/phonegap-ios/www/
	python utils/modify_app_json.py build/App/production/app.json build/phonegap-ios/www/app.json
	./build/phonegap-ios/cordova/build

.PHONY: ios-debug
ios-debug: $(SRC) $(SRC_APP)
	cp -r app build/phonegap-ios/www/
	cp -r resources build/phonegap-ios/www/
	cp -r touch build/phonegap-ios/www/
	cp -r lib build/phonegap-ios/www/
	cp $(SRC) build/phonegap-ios/www/
	python utils/modify_app_json.py app.json build/phonegap-ios/www/app.json

.PHONY: android
android: app
	cp -r build/App/production/* build/phonegap-android/assets/www/
	python utils/modify_app_json.py build/App/production/app.json build/phonegap-android/assets/www/app.json
	./build/phonegap-android/cordova/build

.PHONY: app
app: build/App/production/app.js

build/App/production/app.js: $(SRC) $(SRC_APP)
	sencha app build production || rm $@

.PHONY:
clean:
	rm -rf build/App/production/*
	rm -rf $(filter-out build/phonegap-ios/www/cordova-2.3.0.js, $(shell find build/phonegap-ios/www -mindepth 1 -maxdepth 1))
	rm -rf $(filter-out build/phonegap-android/assets/www/cordova-2.3.0.js, $(shell find build/phonegap-android/assets/www -mindepth 1 -maxdepth 1))
