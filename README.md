# Luxembourg Mobile

## Build Requirements

Building the Luxembourg Mobile Sencha Touch app (LuxMob) requires having Sencha
Cmd 3.0.0.250 and the Android SDK Tools installed.

### Sencha Cmd

Download Sencha Cmd for your OS from
http://www.sencha.com/products/sencha-cmd/download.

Unzip the downloaded zip file:
        
    $ unzip SenchaCmd-3.0.0.250-linux.run.zip

Run the installer:

    $ ./SenchaCmd-3.0.0.250-linux.run --prefix ~/local/opt/ --mode unattended

Using the `unattended` mode the installer does not prompt the user for
questions.

The above command installs Sencha Cmd under
`~/local/opt/Sencha/Cmd/3.0.0.250/`.  The installer also modifies your
`.bashrc` file to extend `PATH` and set `SENCHA_CMD_3_0_0`. So sourcing
`.bashrc` should make the `sencha` command available in the shell.

### JDK

Ant, used by Sencha Cmd, and the Android SDK require a JDK. Make sure you have
JDK 7 installed. See
http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html.

### Android SDK

Download the Android SDK Tools from
http://developer.android.com/sdk/index.html.

For example:

    $ wget http://dl.google.com/android/android-sdk_r21.0.1-linux.tgz
    $ tar xvzf android-sdk_r21.0.1-linux.tgz

To be able to build the LuxMob app, and run it in the Android emulator, you
need to install the Android SDK Platform-tools, and at least one platform (the
latest, 4.2 at time of this writing). You can use the Android SDK Manager to
install these, which you can launch by navigating to the `tools` directory and
running `android`.

Also, you need to add the paths to the Android SDK `platform-tools` and `tools`
directories to the `PATH` environment variable.

For example:

    $ export PATH=${PATH}:${HOME}/local/opt/android-sdk-linux/platform-tools:${HOME}/local/opt/android-sdk-linux/tools

And to persist that adjust the setting of the `PATH` in your `.bashrc`.

## Build

To build the LuxMob app run this command:

    $ sencha app build package

To check that the build process worked correctly list the content of the
`build/LuxMob/ios` and `build/LuxMob/android` directories and compare to the
following:

    $ ls build/LuxMob/ios
    cordova  CordovaLib  LuxMob  LuxMob.xcodeproj  www

    $ ls build/LuxMob/android
    AndroidManifest.xml  ant.properties  assets  bin  build.xml  cordova  gen libs  local.properties  proguard-project.txt  project.properties  res  src

## Run app in iOS emulator

Open `build/LuxMob/ios/LuxMob.xcodeproj` in `Xcode` and press `Run`.

## Run app in Android emulator
