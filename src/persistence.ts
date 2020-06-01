
function load_np_array(data: any) {
    let decoded = Base64.decode(data["data"])
    let dtype = data["dtype"]
    let shape = data["shape"]

    let arr = create_array(decoded, dtype)
    return arr
}

function save_np_array(data: FloatArray | IntArray) {
    let encoded = Base64.encode(data.buffer)
    let dtype = determine_datatype(data)

    let result = {
        "dtype": dtype,
        "data": encoded,
        "shape": [data.length],
        "order": "C",
    }
    return result
}

function load_binary_data_extension(header: any, data: any) {
    let arr = load_np_array(data["data"])
    return { "header": header, "data": arr }
}

function save_binary_data_extension(header: any, data: any) {
    let arr = save_np_array(data["data"])
    return { "header": header, "data": arr }
}

function load_multiple_data_extension(header: any, data: any) {
    let result: any = { "header": header, "length": 0 }
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key == "header") continue;
            const element = data[key];
            result[key] = load_np_array(element)
            result.length += 1
        }
    }
    return result
}

function save_multiple_data_extension(header: any, data: any) {
    let result: any = { "header": header }
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (key == "header") continue;
            if (key == "length") continue;
            const element = data[key]
            result[key] = save_np_array(element)
        }
    }
    return result;
}

function load_table_extension(header: any, data: any) {
    return { "header": header, "data": data["data"] }
}

function save_table_extension(header: any, data: any) {
    return { "header": header, "data": data["data"] }
}

async function load_file(filename: string) {
    console.log("Loading file")
    var tmpout = tmp.fileSync({ postfix: ".json" });
    var success = await call_python("sme_io.py", ["--load", filename, tmpout.name])

    var content: string = fs.readFileSync(tmpout.name, { encoding: "utf-8" })
    var obj = JSON.parse(content)

    var result: any = { "header": obj["header"] }
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (key == "header") continue;
            const element = obj[key];
            const ext_class = element["header"]["extension_class"];
            let ext: any = {};
            if (ext_class == "BinaryDataExtension") {
                ext = load_binary_data_extension(element["header"], element)
            }
            if (ext_class == "MultipleDataExtension") {
                ext = load_multiple_data_extension(element["header"], element)
            }
            if (ext_class == "JSONTableExtension") {
                ext = load_table_extension(element["header"], element)
            }

            result[key] = ext;
        }
    }
    console.log(result)

    return result as SmeFile
}

async function save_file(filename: string, sme: any) {
    var result: any = { "header": sme.header }
    for (const key in sme) {
        if (sme.hasOwnProperty(key)) {
            if (key == "header") continue;
            const element = sme[key];
            const ext_class = element["header"]["extension_class"];
            let ext: any = {};
            if (ext_class == "BinaryDataExtension") {
                ext = save_binary_data_extension(element["header"], element)
            }
            if (ext_class == "MultipleDataExtension") {
                ext = save_multiple_data_extension(element["header"], element)
            }
            if (ext_class == "JSONTableExtension") {
                ext = save_table_extension(element["header"], element)
            }

            result[key] = ext;
        }
    }

    var tmpin = tmp.fileSync({ postfix: ".json" });
    var content = JSON.stringify(result)
    fs.writeFileSync(tmpin.name, content)

    var success = await call_python("sme_io.py", ["--save", tmpin.name, filename])
    console.log("Written file to disk")
    return success
}

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


function determine_datatype(obj: any) {
    if (obj.constructor == Object) return "dict"
    if (Array.isArray(obj)) {
        if (typeof obj[0] === "object") return "array"
        // other array that goes in info.json
        return "object"
    }
    if (obj instanceof Float64Array) return "<f8"
    if (obj instanceof Float32Array) return "<f4"
    if (obj instanceof Int8Array) return "|b1"
    if (obj instanceof Int16Array) return "<i2"
    if (obj instanceof Int32Array) return "<i4"
    if (obj instanceof BigInt64Array) return "<i8"
    if (obj instanceof ArrayBuffer) return "feather"
    if (typeof obj === "string") return "string"
    if (typeof obj === "number") return "number"
    if (typeof obj === "boolean") return "boolean"
    throw new Error(`Data type of ${obj} not recognised`)
}
