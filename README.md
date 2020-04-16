[![Build Status](https://travis-ci.com/AWehrhahn/PySME-GUI.svg?branch=master)](https://travis-ci.com/AWehrhahn/PySME-GUI)

# PySME-GUI

This is a GUI for [PySME](https://github.com/AWehrhahn/SME). It can be used to look at and modify SME structures, and will eventually also be able to monitor a run of PySME.

## Installation

Precompiled binaries for common systems are available under [Releases](https://github.com/AWehrhahn/PySME-GUI/releases/). Those can be installed directly on your system.

## Build

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/AWehrhahn/PySME-GUI
# Go into the repository
cd pysme-gui
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## How it works
The GUI itself is written using Electron, that means most of the code is in javascript. For the parts that need a python script, they all follow the same principle. We save the input parameters to a file, then we spawn a new python process with the filename as a parameter. When the process finishes we load the data from an output file. If there is a log, that is is also written to a file that javascript watches for changes. Basically everything is done via the file system.
