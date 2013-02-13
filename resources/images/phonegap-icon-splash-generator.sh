#!/bin/bash
dest_ios='../../build/cordova-ios/LuxMob/Resources'
dest_android='../../build/cordova-android/res'
usage() { echo "usage: $0 icon colour [dest_dir]"; exit 1; }

convert="convert lion.png -background white -gravity center"
#$convert -resize 512x512 -extent 1280x720 "$3/res/screen/android/screen-xhdpi-landscape.png"
#$convert -resize 256x256 -extent 480x800 "$3/res/screen/android/screen-hdpi-portrait.png"
#$convert -resize 128x128 -extent 320x200 "$3/res/screen/android/screen-ldpi-landscape.png"
#$convert -resize 512x512 -extent 720x1280 "$3/res/screen/android/screen-xhdpi-portrait.png"
#$convert -resize 256x256 -extent 320x480 "$3/res/screen/android/screen-mdpi-portrait.png"
#$convert -resize 256x256 -extent 480x320 "$3/res/screen/android/screen-mdpi-landscape.png"
#$convert -resize 128x128 -extent 200x320 "$3/res/screen/android/screen-ldpi-portrait.png"
#$convert -resize 256x256 -extent 800x480 "$3/res/screen/android/screen-hdpi-landscape.png"
#$convert -resize 256x256 -extent 480x800 "$3/res/screen/bada/screen-portrait.png"
#$convert -resize 128x128 -extent 320x480 "$3/res/screen/bada-wac/screen-type3.png"
#$convert -resize 256x256 -extent 480x800 "$3/res/screen/bada-wac/screen-type4.png"
#$convert -resize 128x128 -extent 240x400 "$3/res/screen/bada-wac/screen-type5.png"
#$convert -resize 256x256 -extent 480x800 "$3/res/screen/bada-wac/screen-type5.png"
#$convert -resize 128x128 -extent 225x225 "$3/res/screen/blackberry/screen-225.png"
#$convert -resize 256x256 -extent 320x480 "$3/res/screen/ios/screen-iphone-portrait.png"
#$convert -resize 256x256 -extent 960x640 "$3/res/screen/ios/screen-iphone-landscape-2x.png"
#$convert -resize 256x256 -extent 480x320 "$3/res/screen/ios/screen-iphone-landscape.png"
#$convert -resize 512x512 -extent 768x1004 "$3/res/screen/ios/screen-ipad-portrait.png"
#$convert -resize 1024x1024 -extent 1536x2008 "$3/res/screen/ios/screen-ipad-portrait-2x.png"
$convert -resize 256x256 -extent 1024x768 "$dest_ios/splash/Default-Landscape~ipad.png"
$convert -resize 256x256 -extent 768x1024 "$dest_ios/splash/Default-Portrait~ipad.png"
$convert -resize 256x256 -extent 640x1136 "$dest_ios/splash/Default-568h@2x~iphone.png"
$convert -resize 256x256 -extent 640x960 "$dest_ios/splash/Default@2x~iphone.png"
$convert -resize 128x128 -extent 320x480 "$dest_ios/splash/Default~iphone.png"
$convert -resize 256x256 -extent 2048x1496 "$dest_ios/splash/Default-Landscape@2x~ipad.png"
$convert -resize 512x512 -extent 1536x2008 "$dest_ios/splash/Default-Portrait@2x~ipad.png"

convert="convert ../icons/artwork.png"
$convert -resize 72x72 "$dest_ios/icons/icon-72.png" 
$convert -resize 144x144 "$dest_ios/icons/icon-72@2x.png" 
$convert -resize 57x57 "$dest_ios/icons/icon.png" 
$convert -resize 114x114 "$dest_ios/icons/icon@2x.png" 

$convert -resize 96x96 "$dest_android/drawable/icon.png" 
$convert -resize 72x72 "$dest_android/drawable-hdpi/icon.png" 
$convert -resize 36x36 "$dest_android/drawable-ldpi/icon.png" 
$convert -resize 48x48 "$dest_android/drawable-mdpi/icon.png" 
$convert -resize 96x96 "$dest_android/drawable-xhdpi/icon.png" 
