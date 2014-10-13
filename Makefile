SRC = app.js app.json index.html openlayers-mobile.js proj4js-compressed.js GeolocateControl.js SavedMapLayer.js
SRC_APP = $(shell find app -name \*.js)
SHA1 = $(shell git rev-parse HEAD)

.PHONY: all
all: app

.PHONY: ios
ios: testingapp
	cp -r build/testing/App/* cordova-app/www/
	cd cordova-app && cordova build ios

.PHONY: android
android: testingapp
	adb uninstall com.c2c.LuxMob
	cp -r build/testing/App/* cordova-app/www/
	cd cordova-app && cordova run android

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
	cp -r build/App/production/* luxmob-svn/
	svn add --quiet --depth infinity luxmob-svn/*
	svn commit -m "Update luxmod [https://github.com/camptocamp/luxembourg_mobileevo/tree/$(SHA1)]" luxmob-svn

.PHONY: svn-checkout
svn-checkout:
	svn co https://project.camptocamp.com/svn/geoportail_luxembourg/trunk/geoadmin/luxmob luxmob-svn

.PHONY:
clean:
	rm -rf build/App/production/*
	rm -rf build/App/testing/*
	rm -rf $(filter-out build/cordova-ios/www/cordova-2.5.0.ios.js, $(shell find build/cordova-ios/www -mindepth 1 -maxdepth 1))
	rm -rf $(filter-out build/cordova-android/assets/www/cordova-2.5.0.android.js, $(shell find build/cordova-android/assets/www -mindepth 1 -maxdepth 1|grep -v .empty_folder))
	rm -f build/cordova-android/local.properties
