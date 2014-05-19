# Luxembourg Mobile

## Build Requirements

Building the Luxembourg Mobile Sencha Touch app (LuxMob) requires installing
Sencha Cmd 4.0.4.84, which has its own requirements (see below).

The Android SDK Tools are also required to build the app for Android.

### Sencha Cmd

Download Sencha Cmd 4.0.4.84 for your OS.

Unzip the downloaded zip file:
        
    $ unzip SenchaCmd-4.0.4.84-linux.run.zip

Run the installer:

    $ ./SenchaCmd-4.0.4.84-linux.run --prefix ~/local/opt/ --mode unattended

Using the `unattended` mode the installer does not prompt the user for
questions.

The above command installs Sencha Cmd under
`~/local/opt/Sencha/Cmd/4.0.4.84/`.  The installer also modifies your
`.bashrc` file to extend `PATH` and set `SENCHA_CMD_3_0_0`. So sourcing
`.bashrc` should make the `sencha` command available in the shell.

### JDK

Ant, used by Sencha Cmd, and the Android SDK require a JDK. Make sure you have
JDK 7 installed. See
http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html.

### Compass

Compass is needed for the project: http://compass-style.org/install/

### Android SDK

Download the Android SDK Tools from
http://developer.android.com/sdk/index.html.

For example:

    $ wget http://dl.google.com/android/android-sdk_r21.0.1-linux.tgz
    $ tar xvzf android-sdk_r21.0.1-linux.tgz

To be able to build the LuxMob app, and run it in the Android emulator, you
need to install the Android SDK Platform-tools, and at least one platform and
system image.

You can use the Android SDK Manager for that, which you launch by
executing `tools/android sdk`. In the Manager select and install `Android SDK
Platform-tools`, and `SDK Platform` and `System Image` for a version of Android
(4.2).

Now create an Android Virtual Device (AVD) using the AVD Manager, which
you launch by executing `tools/android avd`.

You should now be able to start the emulator: `tools/emulator -avd
<virtual_device_name>`, where `<virtual_device_name>` is the name of the
virtual device you just created. For example:

    $ emulator -avd nexus7

Use `adb devices` to see the list of Android devices. The emulated
Android device should be listed as a `device`:

    $ adb devices
    List of devices attached 
    emulator-5554   device
    
Also, for Sencha Cmd to find the Android SDK Tools you need to have the paths
to the `platform-tools` and `tools` directories in your `PATH`.

For example:

    $ export PATH=${PATH}:${HOME}/local/opt/android-sdk-linux/platform-tools:${HOME}/local/opt/android-sdk-linux/tools

To persist that adjust the setting of the `PATH` in your `.bashrc`.

## Build

To build the web app run this command:

    $ make

To build the PhoneGap Android app run this command. A password for the keystore
may be asked:

    $ make android

To build the PhoneGap iOS app run this command:

    $ make ios

If you change the source code of the Sencha app you don't need to run `make`
before running `make android` or `make ios`. The latter commands will build the
Sencha app when required.

## Push the web app to SVN

To be able to deploy the web app it is first needed to copy/commit it into the
Luxembourg project's [SVN
repository](https://project.camptocamp.com/svn/geoportail_luxembourg/trunk/geoadmin/).
The actual deployment of the mobile web app is done as part of the standard
deploy procedure (`deploy-geoadmin.sh`).

To copy/commit the web app into the Luxembourg project's SVN use the
`copy-to-svn` target:

    $ make copy-to-svn

This target checks out the Luxembourg project from SVN, updates the mobile web
app in the `luxmob` directory, and commits the update.

## Install and run app on Android

To install the LuxMob app on an Android device you will use the `adb install`
command. You can choose the device using the `-s` switch. Use `adb devices` to
know what devices you have available.

For example:

    $ adb -s emulator-5554 install -r build/LuxMob/android/bin/LuxMob-debug.apk

The LuxMob app should now available in the Android device.

To see (filtered) logs in a console:

    $ adb logcat | grep -v '^[W\/Trace|E\/StrictMode|E\/ActivityThread]'

## Install and run app in iOS emulator

Open `build/LuxMob/ios/LuxMob.xcodeproj` in `Xcode` and press `Run`.

## Create .ipa for Ad-Hoc deployment

### Add test devices

 - Go to `https://developer.apple.com/ios/manage/devices/index.action` , and add
devices UUID.

 - Then you have to add them to the Provisioning Profile: Go to `https://developer.apple.com/ios/manage/provisioningprofiles/index.action`
`Edit`->`Modify` «Luxembourg mobile» profile, then check the devices.

 - You can now download it, and send it to testers with the «.ipa».
(You may have to download it & open with xcode, or update it with XCode
Organizer).

### Create .ipa

 - Make a production build : `make ios`. (as of now, there’s a bug on first launch
that doesn’t exist in `ios-debug` mode).
 - Select `iOS Device`, in the test device combo. In the menu, select
   `Product`->`Archive`. The `Organizer` windows show up; select the latest archive
   and click on `Distribute` button.
 - Choose `Save for Entreprise or Ad-Hoc Deployment`, then sign with your
   identity.
 - Then you can save your «.ipa», **without** checking `Save for Entreprise
   Distribution`.
