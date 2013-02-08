# Luxembourg Mobile

## Build Requirements

Building the Luxembourg Mobile Sencha Touch app (LuxMob) requires having Sencha
Cmd 3.0.0.250 and the Android SDK Tools installed.

### Sencha Cmd

Download Sencha Cmd 3.0.2.288 for your OS from
http://www.sencha.com/products/sencha-cmd/download.

Unzip the downloaded zip file:
        
    $ unzip SenchaCmd-3.0.2.288-linux.run.zip

Run the installer:

    $ ./SenchaCmd-3.0.2.288-linux.run --prefix ~/local/opt/ --mode unattended

Using the `unattended` mode the installer does not prompt the user for
questions.

The above command installs Sencha Cmd under
`~/local/opt/Sencha/Cmd/3.0.2.288/`.  The installer also modifies your
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

Get submodules

    $ git submodule update --init

To build the web app run this command:

    $ make

To build the PhoneGap Android app run this command:

    $ make android

To build the PhoneGap iOS app run this command:

    $ make ios

If you change the source code of the Sencha app you don't need to run `make`
before running `make android` or `make ios`. The latter commands will build he
Sencha app when required.

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
