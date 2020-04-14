// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog } = require('electron').remote
var fs = require('fs');
var JSZip = require("jszip");
const { Table } = require("apache-arrow");
const { spawn } = require('child_process');
const { join } = require('path');
var tmp = require('tmp');


interface ZipObject {
    name: string
    async: Function
}

interface SmeFile {
    [id: string]: any;
}

var sme: SmeFile;

class SmeError {
    constructor(public message: string) {
    }
}

class EndianError extends SmeError { }
class IdlError extends SmeError { }


function checkEndian() {
    var arrayBuffer = new ArrayBuffer(2);
    var uint8Array = new Uint8Array(arrayBuffer);
    var uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte
    if (uint16array[0] === 0xBBAA) return true; // little endian
    if (uint16array[0] === 0xAABB) return false; // big endian
    else throw new Error("Something crazy just happened");
}

function load_json(text: string) {
    var content = JSON.parse(text)
    return content
}

async function load_npz(data: ArrayBuffer) {
    var zip = await JSZip.loadAsync(data)
    var length = 0
    zip.forEach(() => length += 1)
    var arr = Array.from({ length: length }, (v, i) => null)
    zip.forEach((relative_path: string, zipEntry: ZipObject) => {
        arr[Number(zipEntry.name.slice(4, -4))] = zipEntry;
    })

    for (let index = 0; index < length; index++) {
        const element: ZipObject = arr[index];
        var tmp: ArrayBuffer = await element.async("arraybuffer")
        arr[index] = load_npy(tmp)
    }
    return arr
}

function create_array(data: ArrayBuffer, descr: string) {
    var endian = (descr[0] == "<")
    var floatiness = descr[1]
    var bytenumber = Number(descr[2])

    if ((descr[0] != "|") && (endian != checkEndian())) {
        // TODO: flip endianness of data
        throw new EndianError(`Endianess of datafile ${descr[0]} does not match machine Endianness`)
    }

    // new DataView(buffer).setFloat64(0, endian_flag)
    if (floatiness == "f") {
        // Floating point number
        if (bytenumber == 4) {
            return new Float32Array(data)
        }
        if (bytenumber == 8) {
            return new Float64Array(data)
        }
        throw new Error(`Array is floating point, but the bytenumber ${bytenumber} is not supported`)
    }
    if (floatiness == "i") {
        // signed integer
        if (bytenumber == 2) {
            return new Int16Array(data)
        }
        if (bytenumber == 4) {
            return new Int32Array(data)
        }
        if (bytenumber == 8) {
            return new BigInt64Array(data)
        }
        throw new Error(`Array is integer, but the bytenumber ${bytenumber} is not supported`)
    }
    if (floatiness == "b") {
        if (bytenumber == 1) {
            return new Int8Array(data)
        }
        throw new Error(`Array is byte, but the bytenumber ${bytenumber} is not supported`)
    }
    throw new Error(`Datatype ${floatiness} of the Array not understood`)
}

function load_npy(data: ArrayBuffer) {
    var decoder = new TextDecoder()
    var magic = data.slice(0, 6)
    var major = new DataView(data, 6, 1).getUint8(0)
    var minor = new DataView(data, 7, 1).getUint8(0)
    var header_len = new DataView(data, 8, 2).getUint16(0, true)

    var header = decoder.decode(data.slice(10, 10 + header_len)).trim().slice(1, -1)

    var descr = header.match("'descr':(.*?),")[1].trim().slice(1, -1)
    var fortran = eval(header.match("'fortran_order':(.*?),")[1].trim().toLowerCase())
    var shape: number[] = eval(header.match("'shape': *(\(.*\)),")[1].trim().replace("(", "[").replace(")", "]"))

    var arraydata = create_array(data.slice(10 + header_len), descr)
    //TODO: shape and fortran_order

    if (shape.length > 1) {
        if (shape.length == 2) {
            var nseg = shape[0]
            var npoints = shape[1]
            var arr = Array.from({ length: nseg }, (v, i) => {
                return arraydata.slice(i * npoints, (i + 1) * npoints)
            })
            return arr
        }
        console.warn("Only 1D and 2D arrays at the moment, but got shape: " + shape)

    }

    return arraydata
}

function load_feather(data: ArrayBuffer) {
    console.warn("Linelist fileformat not working at the moment")
    return data
    // return Table.from([data]);
}

async function load_file(filename: string) {
    var promise = new Promise((resolve, reject) => {
        fs.readFile(filename, (err: any, data: any) => {
            if (err) {
                reject(err.message)
                return;
            }
            resolve(data)
        })
    });
    try {
        var data = await promise
        var zip = await JSZip.loadAsync(data)
    } catch (err) {
        throw new IdlError(err.message)
    }

    var length = 0
    zip.forEach(() => length += 1)
    var arr = Array.from({ length: length }, (v, i) => null)
    var i = 0
    zip.forEach((relative_path: string, zipEntry: ZipObject) => {
        arr[i] = zipEntry;
        i += 1
    })

    var files: SmeFile = {}

    for (let index = 0; index < length; index++) {
        const element: ZipObject = arr[index];
        const name = element.name;
        switch (name.split(".")[1]) {
            case "json":
                files[name.slice(0, -5)] = load_json(await element.async("string"))
                break;
            case "npz":
                files[name.slice(0, -4)] = await load_npz(await element.async("arraybuffer"))
                break;
            case "npy":
                files[name.slice(0, -4)] = load_npy(await element.async("arraybuffer"))
                break;
            case "feather":
                files[name.slice(0, -8)] = load_feather(await element.async("arraybuffer"))
                break;
            default:
                console.log("File type not understood: " + name)
                break;
        }
    }
    return files
}

function determine_datatype(obj: any) {
    if (obj.constructor == Object) return "dict"
    if (Array.isArray(obj)) return "array"
    if (obj instanceof Float64Array) return "<f8"
    if (obj instanceof Float32Array) return "<f4"
    if (obj instanceof Int8Array) return "|b1"
    if (obj instanceof Int16Array) return "<i2"
    if (obj instanceof Int32Array) return "<i4"
    if (obj instanceof BigInt64Array) return "<i8"
    if (obj instanceof ArrayBuffer) return "feather"
    throw new Error(`Data type of ${obj} not recognised`)
}

function save_npy(obj: Float64Array, dtype: string) {
    var encoder = new TextEncoder()
    var magic = new Uint8Array([147, 78, 85, 77, 80, 89]) // "\x93NUMPY"
    var major = new Uint8Array([1])
    var minor = new Uint8Array([0])

    var shape = obj.length
    var header_str = `{'descr': '${dtype}', 'fortran_order': False, 'shape': (${shape},), }`
    var total = (6 + 2 + 2 + header_str.length + 1) % 64
    if (total != 0) total = 64 - total
    header_str = header_str.padEnd(header_str.length + total) + "\n"
    var header = encoder.encode(header_str)
    var header_len = new Uint8Array((new Uint16Array([header.length])).buffer)

    var arraydata = new Uint8Array(obj.buffer)

    // TODO: combine everything into one big buffer
    var buffer = new Uint8Array(6 + 2 + 2 + header.length + obj.buffer.byteLength)
    buffer.set(magic)
    buffer.set(major, 6)
    buffer.set(minor, 7)
    buffer.set(header_len, 8)
    buffer.set(header, 10)
    buffer.set(arraydata, 10 + header.length)
    return buffer
}

async function save_npz(obj: Array<Float64Array>) {
    var zip = JSZip()
    for (let i = 0; i < obj.length; i++) {
        const element = obj[i];
        var name = `arr_${i}.npy`
        var dtype = determine_datatype(element)
        var buffer = save_npy(element, dtype)
        zip.file(name, buffer)
    }
    var stream = await zip.generateAsync({ type: "arraybuffer" })
    return stream
}

function save_feather(obj: ArrayBuffer) {
    return obj
}

async function save_file(fname: string, sme: SmeFile) {
    var zip = JSZip()
    console.log(sme)

    for (const key in sme) {
        if (sme.hasOwnProperty(key)) {
            const element = sme[key];
            var dtype = determine_datatype(element)
            var content: any = ""
            var ending = "dat"
            switch (dtype) {
                case "dict":
                    content = JSON.stringify(element)
                    ending = "json"
                    break;
                case "array":
                    // Save as npz
                    content = await save_npz(element)
                    ending = "npz"
                    break;
                case "<f8":
                case "<f4":
                case "|b1":
                case "<i2":
                case "<i4":
                case "<i8":
                    // save as npy
                    content = save_npy(element, dtype)
                    ending = "npy"
                    break;
                case "feather":
                    content = save_feather(element)
                    ending = "feather"
                    break;
                default:
                    throw new Error(`No saving mechanism for given filetype ${dtype}`)
                    break;
            }
            zip.file(`${key}.${ending}`, content)
        }
    }
    // var content: ArrayBuffer
    // fs.writeFile(fname, content, (err: Error) => { if (err) throw err; console.log("Saved file") })
    zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(fname))
        .on('finish', function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            console.log("out.zip written.");
        });
}


async function cast_to_little_endian(fname: string) {
    console.log("Converting sme file to little endian")
    var script_file = join(__dirname, "scripts/to_little_endian.py")
    var tmpobj = tmp.fileSync({ postfix: ".sme" });
    var fname_out: string = tmpobj.name;
    console.log(fname_out)

    var promise = new Promise<string>((resolve, reject) => {
        var child = spawn("python", [script_file, fname, fname_out])

        child.on('exit', (code: any, signal: any) => {
            console.log(`child process exited with code ${code}`);
            resolve(fname_out)
        });
    })

    return promise
}

async function load_from_idl_file(fname: string) {
    console.log("Converting sme file to little endian")
    var script_file = join(__dirname, "scripts/from_idl_file.py")
    var tmpobj = tmp.fileSync({ postfix: ".sme" });
    var fname_out: string = tmpobj.name;
    console.log(fname_out)

    var promise = new Promise<string>((resolve, reject) => {
        var child = spawn("python", [script_file, fname, fname_out])

        child.on('exit', (code: any, signal: any) => {
            console.log(`child process exited with code ${code}`);
            resolve(fname_out)
        });
    })

    return promise
}

var ButtonLoad = document.getElementById("btn-load")
ButtonLoad.addEventListener('click', async (event) => {
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        console.log("Opening new file: " + fname)
        var isLoaded = false;
        while (!isLoaded) {
            try {
                console.log("Load file: " + fname)
                sme = await load_file(fname)
                isLoaded = true;
                break;
            } catch (err) {
                // if error is big endian
                console.error(err)
                if (err instanceof EndianError) {
                    console.log("Casting file to little endian")
                    fname = await cast_to_little_endian(fname)
                    console.log("New filename: " + fname)
                }
                if (err instanceof IdlError) {
                    console.log("Loading IDL SME file")
                    fname = await load_from_idl_file(fname)
                }
            }
        }
        plot_sme(sme)
    } else {
        console.log("User did not select a file")
    }
})

var ButtonSave = document.getElementById("btn-save")
ButtonSave.addEventListener('click', async (event) => {
    var out = await dialog.showSaveDialog({ properties: ["showOverwriteConfirmation"] })
    if (!out.canceled) {
        var fname = out.filePath
        console.log("Saving to file: " + fname)
        save_file(fname, sme)
    } else {
        console.log("User did not select a file")
    }
})