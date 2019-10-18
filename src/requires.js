const path = require('path')

const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

const zerorpc = require("zerorpc")
const Plotly = require('plotly.js-dist')
