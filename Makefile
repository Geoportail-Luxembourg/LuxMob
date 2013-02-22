SRC = app.js app.json index.html openlayers-mobile.js proj4js-compressed.js GeolocateControl.js SavedMapLayer.js
SRC_APP = $(shell find app -name \*.js)

.PHONY: all
all: app

.PHONY: ios
ios: ios-json app
	cp -r build/App/production/* build/cordova-ios/www/
	./build/cordova-ios/cordova/build
	mv app.json.bak app.json

.PHONY: ios-debug
ios-debug: $(SRC) $(SRC_APP)
	cp -r app build/cordova-ios/www/
	cp -r resources build/cordova-ios/www/
	cp -r touch build/cordova-ios/www/
	cp -r lib build/cordova-ios/www/
	python utils/modify_app_json.py cordova-2.3.0.ios.js
	cp $(SRC) build/cordova-ios/www/
	cp cordova-2.3.0.ios.js build/cordova-ios/www
	mv app.json.bak app.json

ios-json:
	python utils/modify_app_json.py cordova-2.3.0.ios.js

.PHONY: android
android: android-json build/cordova-android/local.properties app
	cp -r build/App/production/* build/cordova-android/assets/www/
	./build/cordova-android/cordova/build
	adb uninstall com.c2c.LuxMob
	./build/cordova-android/cordova/run
	rm -rf app.json
	mv app.json.bak app.json

android-json:
	python utils/modify_app_json.py cordova-2.3.0.android.js

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
	sencha app build production || rm -f $@

.PHONY:
clean:
	rm -rf build/App/production/*
	rm -rf $(filter-out build/cordova-ios/www/cordova-2.3.0.js, $(shell find build/cordova-ios/www -mindepth 1 -maxdepth 1))
	rm -rf $(filter-out build/cordova-android/assets/www/cordova-2.3.0.js, $(shell find build/cordova-android/assets/www -mindepth 1 -maxdepth 1))
	rm -f build/cordova-android/local.properties
