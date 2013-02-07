SRC = app.js app.json index.html openlayers-mobile.js GeolocateControl.js SavedMapLayer.js
SRC_APP = $(shell find app -name \*.js)

.PHONY: all
all: app

.PHONY: ios
ios: app
	cp -r build/App/production/* build/cordova-ios/www/
	python utils/modify_app_json.py build/App/production/app.json build/cordova-ios/www/app.json
	./build/cordova-ios/cordova/build

.PHONY: ios-debug
ios-debug: $(SRC) $(SRC_APP)
	cp -r app build/cordova-ios/www/
	cp -r resources build/cordova-ios/www/
	cp -r touch build/cordova-ios/www/
	cp -r lib build/cordova-ios/www/
	cp $(SRC) build/cordova-ios/www/
	python utils/modify_app_json.py app.json build/cordova-ios/www/app.json

.PHONY: android
android: build/cordova-android/local.properties app
	cp -r build/App/production/* build/cordova-android/assets/www/
	python utils/modify_app_json.py build/App/production/app.json build/cordova-android/assets/www/app.json
	./build/cordova-android/cordova/build
	adb uninstall com.c2c.LuxMob
	./build/cordova-android/cordova/run

# !! The app doesn't currently work in debug mode in the Android emulator !!
.PHONY: ios-debug
android-debug: $(SRC) $(SRC_APP)
	cp -r app build/cordova-android/assets/www/
	cp -r resources build/cordova-android/assets/www/
	cp $(SRC) build/cordova-android/assets/www/
	python utils/modify_app_json.py app.json build/cordova-android/assets/www/app.json
	./build/cordova-android/cordova/build
	adb uninstall com.c2c.LuxMob
	./build/cordova-android/cordova/run

build/cordova-android/local.properties:
	android update project -p build/cordova-android/

.PHONY: app
app: build/App/production/app.js

build/App/production/app.js: $(SRC) $(SRC_APP)
	sencha app build production || rm $@

.PHONY:
clean:
	rm -rf build/App/production/*
	rm -rf $(filter-out build/cordova-ios/www/cordova-2.3.0.js, $(shell find build/cordova-ios/www -mindepth 1 -maxdepth 1))
	rm -rf $(filter-out build/cordova-android/assets/www/cordova-2.3.0.js, $(shell find build/cordova-android/assets/www -mindepth 1 -maxdepth 1))
	rm -f build/cordova-android/local.properties
