

// Connect to the Python server
let client = new zerorpc.Client()
var port = ipcRenderer.sendSync('python-port') // TODO: use the same port as in main
var url = 'tcp://127.0.0.1:' + port
client.connect(url)
client.on("error", (error) => { alert("RPC client error: ", error); });

const call = (name, args, callback) => {
    client.invoke(name, args, (err, res, more) => {
        // If we get an error from python (But not from zerorpc)
        // Then we consider that still an error
        if ((err == null) && typeof(res) === 'string') {
            if (res.indexOf("ERROR") >= 0) {
                err = res;
            }
        }
        if (err) { console.error(err) }
        callback(err, res)
    })
}

const echo = (text, callback) => {
    return call("echo", text, callback)
}

const empty = (callback) => {
    return call("new", null, callback)
}

const load = (fname, callback) => {
    return call("load", fname, callback)
}

const save = (fname, callback) => {
    return call("save", fname, callback)
}

const get_spectrum = (segment, callback) => {
    return call("get_spectrum", segment, callback)
}

const get_synthetic = (segment, callback) => {
    return call("get_synthetic", segment, callback)
}

const get_line_mask = (segment, callback) => {
    return call("get_line_mask", segment, callback)
}

const get_cont_mask = (segment, callback) => {
    return call("get_cont_mask", segment, callback)
}

const get_annotations = (segment, wmin, wmax, callback) => {
    return call("get_annotations", [segment, wmin, wmax], callback)
}

const set_mask = (segment, points, value, callback) => {
    return call("set_mask", [segment, points, value], callback)
}