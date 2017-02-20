SRC = app.js app.json index.html openlayers-mobile.js proj4js-compressed.js GeolocateControl.js SavedMapLayer.js
SRC_APP = $(shell find app -name \*.js)
SHA1 = $(shell git rev-parse HEAD)

.PHONY: ios
ios: testingapp
	cp -r build/testing/App/* cordova-app/www/
	cd cordova-app && cordova build ios

.PHONY: android-debug
android-debug: testingapp
	adb uninstall com.c2c.LuxMob
	cp -r build/testing/App/* cordova-app/www/
	cd cordova-app && cordova run android

.PHONY: android
android: testingapp
	cd cordova-app && cordova build android --release -- --keystore=platforms/android/app_signing.keystore  --alias=release

.PHONY: app
app: external/openlayers build/App/production/app.js

.PHONY: testingapp
testingapp: external/openlayers build/App/testing/app.js

build/App/testing/app.js: $(SRC) $(SRC_APP)
	sencha app build testing || rm -f $@

build/App/production/app.js: $(SRC) $(SRC_APP)
	sencha app build production || rm -f $@

external/openlayers:
	git submodule update --init

.PHONY: copy-to-svn
copy-to-svn: svn-checkout app
	cp -r build/production/App/* luxmob-svn/
	svn add --force --quiet --depth infinity luxmob-svn/*
	svn commit -m "Update luxmod [https://github.com/camptocamp/luxembourg_mobileevo/tree/$(SHA1)]" luxmob-svn

.PHONY: svn-checkout
svn-checkout:
	svn co https://project.camptocamp.com/svn/geoportail_luxembourg/trunk/geoadmin/luxmob luxmob-svn

.PHONY:
clean:
	rm -rf build/production/*
	rm -rf build/testing/*
	rm -rf luxmob-svn
