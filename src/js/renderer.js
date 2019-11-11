// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const { BrowserWindow, dialog, console } = require('electron').remote
// const path = require('path')


var logfilename = path.join(__dirname, '..', 'python', 'python_server.log')
var LogTextArea = document.getElementById("log-textarea")
var regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (DEBUG|INFO|ERROR|WARNING|CRITICAL) - (.*?) - (.*)$/gm
var lines_read = 0;
var lines = []

// print_log gets all entries in the log
// and then filters down to the ones requested
// and then prints them in the correct text area
const print_log = (lines) => {
  var show_levels = ["INFO"]
  var text = "";
  for (var line in lines){
    line = lines[line]
    timestamp = line[0]
    label = line[1]
    pymodule = line[2]
    message = line[3]

    // Filter to only the relevant entries
    if (label == show_levels[0]){
      text += timestamp + " - " + label + " - " + pymodule + " - " + message + "\n"
    } 
  }
  LogTextArea.textContent = text;
}

// let vue deal with it?
// usePolling needs to be true only on Windows?
chokidar.watch(logfilename, { usePolling: true }).on('all', (event, path) => {
  // Only read the newest changes from the file?
});

// read the whole log as it exists on startup
fs.readFile(logfilename, 'utf-8', (err, data) => {
  if(err){
      alert("An error ocurred reading the file :" + err.message);
      return;
  }

  lines = [];
  var d;
  while (d = regex.exec(data)){
    timestamp = d[1]
    label = d[2]
    pymodule = d[3]
    message = d[4]
    lines.push([timestamp, label, pymodule, message])
  }
  console.log(lines)
  lines_read = lines.length

  print_log(lines)
});