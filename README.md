# Luxembourg Mobile

## Build Requirements

Building the Luxembourg Mobile Sencha Touch app requires having Sencha Cmd
3.0.0.250 installed.

To install Sencha Cmd:

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

## Build

To build the app run this command:

    $ sencha app build package
