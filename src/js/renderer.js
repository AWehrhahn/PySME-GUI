// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const { BrowserWindow, dialog, console } = require('electron').remote
// const path = require('path')




// Simple Button to test the PyServer for Debugging
const newWindowBtn = document.getElementById('new-window')
newWindowBtn.addEventListener('click', (event) => {
  echo("Blub", (err, res) => { console.log(res) })
})


