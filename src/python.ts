const { spawn } = require('child_process');

async function call_python(script: string, args: string[]) {
    var promise = new Promise<boolean>((resolve, reject) => {
        var script_file = join(__dirname, "scripts", script)
        args.unshift(script_file)
        var child = spawn("python", args)

        child.on('exit', (code: any, signal: any) => {
            console.log(`child process exited with code ${code}`);
            if (code == 0) {
                resolve(true)
            } else {
                try {
                    var err: string = fs.readFileSync(join(__dirname, "scripts/python.txt"), { encoding: "utf-8" })
                    console.error(err)
                    reject(err)
                } catch (err) {
                    console.error(`Unknown Python Error, code: ${code}`)
                    reject(`Unknown Python Error, code: ${code}`)
                }
            }
        });
    })
    return promise
}