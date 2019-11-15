// Connect to the Python server
let client = new zerorpc.Client()

ipcRenderer.on("python-ready", (event, port) => {
    var url = 'tcp://127.0.0.1:' + port
    client.on("error", (error) => { alert("RPC client error: ", error); });
    client.connect(url)
    console.log("Connected to url: ", url)
})
ipcRenderer.send("python-start")
// var port = ipcRenderer.sendSync('python-port') // TODO: use the same port as in main

const call = (name, args) => new Promise((resolve, reject) => {
    client.invoke(name, args, (err, res, more) => {
        // If we get an error from python (But not from zerorpc)
        // Then we consider that still an error
        if (err) reject(err);
        else if ((err == null) && typeof (res) === 'string') {
            if (res.indexOf("ERROR") >= 0) {
                reject(res)
            }
        }
        else resolve(res)
    })
})

const echo = (text) => {
    return call("echo", text)
}

const empty = () => {
    return call("new", null)
}

const load = (fname) => {
    return call("load", fname)
}

const save = (fname) => {
    return call("save", fname)
}

const synthesize_spectrum = () => {
    return call("synthesize_spectrum", null)
}

const solve = () => {
    return call("solve", null)
}

const get_spectrum = (segment) => {
    return call("get_spectrum", segment)
}

const get_synthetic = (segment) => {
    return call("get_synthetic", segment)
}

const get_line_mask = (segment) => {
    return call("get_line_mask", segment)
}

const get_cont_mask = (segment) => {
    return call("get_cont_mask", segment)
}

const get_annotations = (segment, wmin, wmax) => {
    return call("get_annotations", [segment, wmin, wmax])
}

const get_parameters = () => {
    return call("get_parameters", null)
}

const set_parameters = (dict) => {
    return call("set_parameters", dict)
}

const set_mask = (segment, points, value) => {
    return call("set_mask", [segment, points, value])
}