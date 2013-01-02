# Luxembourg Mobile

## Build Requirements

Building the Luxembourg Mobile Sencha Touch app requires having Sencha Cmd
3.0.0.250 and the Android SDK Tools installed.

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

### Android SDK

Download the Android SDK Tools from
http://developer.android.com/sdk/index.html. For example:

    $ wget http://dl.google.com/android/android-sdk_r21.0.1-linux.tgz
    $ tar xvzf android-sdk_r21.0.1-linux.tgz

Now add the paths to the Android SDK `platform-tools` and `tools` directories
to the `PATH` environment variable. For example:

    $ export PATH=${PATH}:${HOME}/local/opt/android-sdk-linux/platform-tools:${HOME}/local/opt/android-sdk-linux/tools

To persist that change the setting of the `PATH` environment variable in your
`.bashrc`.

Now install Platform-tools by running the following command from the
Android SDK directory:

    $ tools/android update sdk --no-ui

### JDK

Ant, used by Sencha Cmd, requires a JDK. Make sure you have JDK 7 installed.
See
http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html.

## Build

To build the app run this command:

    $ sencha app build package
