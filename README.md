[![Build Status](https://travis-ci.com/AWehrhahn/PySME-GUI.svg?branch=master)](https://travis-ci.com/AWehrhahn/PySME-GUI)

# PySME-GUI

This is a GUI for [PySME](https://github.com/AWehrhahn/SME). It can be used to look at and modify SME structures, and will eventually also be able to monitor a run of PySME.

## Installation

Precompiled binaries for common systems are available under [Releases](https://github.com/AWehrhahn/PySME-GUI/releases/). Those can be installed directly on your system. The GUI is not completely independent but requires PySME to be installed for some operations. Make sure it is working in the same virtual environment!

### How To Use

Once the programm is open, you should be presented with an almost empty window. Start off by reading a SME file by clicking the "Load File" button. The spectrum should then be plotted in the central window. To switch between segments, use the slider on the bottom. To zoom in use the mouse.

### Changing the mask

To change the mask, select the "box select" tool in the upper right corner of the plot and use the buttons bellow the plot to select what values to change the mask to. Then select the desired region in the plot. The changes should be visible immediately.

### Saving the file

Save the SME file by clicking the "Save File" button.

### Running the PySME
*EXPERIMENTAL*

To run PySME directly from the GUI use the "Synthesize" and "Fit" buttons. At the moment this will fit "teff", "logg", and "monh".
Do not close the GUI once it is running, or you will probably loose all progress. If you still do, the output file is in the tmp directory of your system.

## Build

This is only required if you want to modify the source code of the GUI or install it on a system that is not supported by default.

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
The GUI itself is written using [Electron](https://www.electronjs.org/), that means most of the code is in javascript. For the parts that need a python script, they all follow the same principle. We save the input parameters to a file, then we spawn a new python process with the filename as a parameter. When the process finishes we load the data from an output file. If there is a log, that is is also written to a file that javascript watches for changes. Basically everything is done via the file system.

The HTML/CSS is mostly [Bootstrap 4](https://getbootstrap.com/) with some changes from the [SB Admin 2 Template](https://github.com/BlackrockDigital/startbootstrap-sb-admin-2). The CSS is compiled from the SCSS files in the scss folder using [SASS](https://sass-lang.com/). All color definitions etc should be done there. The HTML has the actual location of most objects, although some are created in scripts.

Each "card" in the GUI is controlled by one [typescript](https://www.typescriptlang.org/) file in src. Also there is one file for the process in general (renderer.ts) and one to create the window in the first place (main.ts). All typescript definitions are in interfaces.ts. The code has to be compiled by typescript into javascript files.

The main plot is done using [plotly](https://plotly.com/), this includes the tools to manipulate the plot. The linelist table is done usongh [DataTables](https://datatables.net/). The citation module uses [citation.js](https://citation.js.org/).

Miscellaneous data files are stored in the data folder. So far those are only used for the citation module.