const path = require('path')

const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

const zerorpc = require("zerorpc")
const Plotly = require('plotly.js-dist')
const chokidar = require('chokidar')
var fs = require('fs');

window.$ = window.jQuery = require('jquery')
require('popper.js')
require('bootstrap')
require('feather-icons').replace()
