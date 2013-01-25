SRC = app.js app.json index.html $(shell find app -name \*.js)

.PHONY: all
all: app

.PHONY: ios
ios: app
	cp -r build/App/production/* build/phonegap-ios/www/
	python utils/modify_app_json.py build/App/production/app.json build/phonegap-ios/www/app.json
	./build/phonegap-ios/cordova/build

.PHONY: android
android: app
	cp -r build/App/production/* build/phonegap-android/assets/www/
	python utils/modify_app_json.py build/App/production/app.json build/phonegap-android/assets/www/app.json
	./build/phonegap-android/cordova/build

.PHONY: app
app: build/App/production/app.js

build/App/production/app.js: $(SRC)
	sencha app build production || rm $@

.PHONY:
clean:
	rm -rf build/App/production/*
	rm -rf $(filter-out build/phonegap-ios/www/cordova-2.3.0.js, $(shell find build/phonegap-ios/www/ -mindepth 1 -maxdepth 1))
	rm -rf $(filter-out build/phonegap-android/assets/www/cordova-2.3.0.js, $(shell find build/phonegap-android/assets/www/ -mindepth 1 -maxdepth 1))
