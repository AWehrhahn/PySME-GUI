
// Define Sidebar actions
var ButtonNew = document.getElementById("sidebar-new")
ButtonNew.addEventListener('click', (event) => {
    console.log("Clicked 'New' in sidebar")
    empty((err, res) => { console.log("Created empty SME structure") })
})

// Load Button
var ButtonLoad = document.getElementById("sidebar-load")
ButtonLoad.addEventListener('click', (event) => {
    console.log("Clicked 'Open' in the sidebar")
    console.log("Opening 'Open File Dialog'")
    dialog.showOpenDialog({ properties: ["openFile"] }).then((out) => {
        if (!out.canceled) {
            var fname = out.filePaths[0];
            console.log("Opening new file: " + fname)
            load(fname).then((res) => {
                nSegment = res;
                plot(0);
                update_parameters();
            }).catch((err) => console.error(err))
        } else {
            console.log("User did not select a file")
        }
    })
})

// Save Button
var ButtonSave = document.getElementById("sidebar-save")
ButtonSave.addEventListener('click', (event) => {
    console.log("Clicked 'Save' in the sidebar")
    fname = "test.sme"

    console.log("Saving SME structure to file: " + fname)
    save(fname).then((res) => console.log("Data saved")).catch((err) => console.error(err))
})


// Save Button
var ButtonSaveAs = document.getElementById("sidebar-save-as")
ButtonSaveAs.addEventListener('click', (event) => {
    console.log("Clicked 'Save As' in the sidebar")
    console.log("Opening 'Save File Dialog'")
    var selection = dialog.showSaveDialog({ properties: ["openFile"] }).then((out) => {
        if (!out.canceled) {
            var fname = out.filePath
            console.log("Saving SME structure to file: " + fname)
            save(fname).then((res) => console.log("Data saved")).catch((err) => console.error(err))
        } else {
            console.log("User did not select a file")
        }
    })
})

// // Show Spectrum Button
// var ButtonWindowPlot = document.getElementById("sidebar-show-spectrum")
// ButtonWindowPlot.addEventListener('click', (event) => {
//     console.log("Clicked 'Show Spectrum' in the sidebar")
//     var window = document.getElementById("window-spectrum")
//     var window2 = document.getElementById("window-parameters")
//     window.style.display = "block"
//     window2.style.display = "none"
// })


// // Show Parameters Button
// var ButtonWindowParameters = document.getElementById("sidebar-show-parameters")
// ButtonWindowParameters.addEventListener('click', (event) => {
//     console.log("Clicked 'Show Parameters' in the sidebar")
//     var window = document.getElementById("window-spectrum")
//     var window2 = document.getElementById("window-parameters")
//     window.style.display = "none"
//     window2.style.display = "block"
// })


