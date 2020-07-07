// Make this a setting that persist through restart?
var python_command: string = "python"

async function call_python(script: string, args: string[]) {
    var promise = new Promise<boolean>((resolve, reject) => {
        var script_file = join(__dirname, "scripts", script)
        args.unshift(script_file)
        // TODO test the version of the default python and also try python3
        var child = spawn(python_command, args)

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