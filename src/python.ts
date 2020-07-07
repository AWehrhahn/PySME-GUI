
var settings = require('electron-settings');

settings.configure({ dir: join(homedir, ".sme"), fileName: "gui-config.json", prettify: true })

if (!settings.hasSync("python.command")) {
    let obj = settings.getSync()
    if (!obj.hasOwnProperty("python")) {
        obj["python"] = {}
    }
    obj["python"]["command"] = "python"
    settings.setSync(obj)
}

// Make this a setting that persist through restart?

async function call_python(script: string, args: string[]) {
    var promise = new Promise<boolean>((resolve, reject) => {
        var script_file = join(__dirname, "scripts", script)
        args.unshift(script_file)
        // TODO test the version of the default python and also try python3
        let obj = settings.getSync()
        var python_command: string = obj["python"]["command"]

        try {
            var child = spawn(python_command, args)
        } catch (err) {
            let puberr = `Could not launch python using command '${python_command}\n${err}`
            show_error(puberr)
            console.error(err)
            reject(puberr)
        }

        child.on('exit', (code: any, signal: any) => {
            console.log(`child process exited with code ${code}`);
            if (code == 0) {
                resolve(true)
            } else {
                try {
                    var err: string = fs.readFileSync(join(__dirname, "scripts/python.txt"), { encoding: "utf-8" })
                    show_error(err)
                    console.error(err)
                    reject(err)
                } catch (err) {
                    err = `Unknown Python Error, code: ${code}\n${err}`
                    show_error(err)
                    console.error(err)
                    reject(err)
                }
            }
        });
    })
    return promise
}