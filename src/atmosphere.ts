// Define Variables
var FieldAtmosphereFile = document.getElementById("par-atmosphere-file") as HTMLSelectElement
var ButtonAtmosphereAdd = document.getElementById("btn-atmosphere-add") as HTMLButtonElement
var FieldAtmosphereGeometry = document.getElementById("par-atmosphere-geometry") as HTMLSelectElement
var FieldAtmosphereMethod = document.getElementById("par-atmosphere-method") as HTMLSelectElement


var atmo_files: string[] = [];

// listen to global/custom events
addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    if (!updated.length || updated.includes("atmosphere")) {
        load_atmosphere_values(sme)
    }
})

addEventListener("config_loaded", (event: any) => {
    let config: Config = event.detail
    load_atmosphere_files(config)
})

// define functions
function load_atmosphere_values(sme: SmeFile) {
    let atmo_file: string = sme.atmo.header.source
    add_atmosphere_file(atmo_file)
    FieldAtmosphereFile.value = sme.atmo.header.source
    FieldAtmosphereGeometry.value = sme.atmo.header.geom
    FieldAtmosphereMethod.value = sme.atmo.header.method
}

async function load_atmosphere_files(config: Config) {
    // Add files that are available from the server
    let atmo_file = join(homedir, ".sme", config["data.pointers.atmospheres"])
    let data: string = fs.readFileSync(atmo_file, "utf-8")
    let json = JSON.parse(data)
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            add_atmosphere_file(key)
        }
    }

    // Add atmosphere files in the correct folder
    let misc_files_dir = untildify(config["data.atmospheres"])
    var misc_files = fs.readdirSync(misc_files_dir, { withFileTypes: true });
    for (let index = 0; index < misc_files.length; index++) {
        const element = misc_files[index];
        if (element.isFile()) {
            add_atmosphere_file(element.name)
        }
    }
}

function add_atmosphere_file(fname: string) {
    if (!atmo_files.includes(fname)) {
        let opt = document.createElement("option")
        opt.value = fname
        opt.innerHTML = fname
        FieldAtmosphereFile.appendChild(opt)
        atmo_files.push(fname)
    }
}

// listen for events


ButtonAtmosphereAdd.addEventListener("click", async (event) => {
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        try {
            add_atmosphere_file(fname)
            FieldAtmosphereFile.value = fname
            sme.atmo.header.source = fname
        } catch (err) {
            console.error(err)
        }
    }
})

FieldAtmosphereFile.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    sme.atmo.header.source = target.value
})

FieldAtmosphereGeometry.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let value = target.value as AtmosphereGeometry
    sme.atmo.header.geom = value
})

FieldAtmosphereMethod.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let value = target.value as AtmosphereMethod
    sme.atmo.header.method = value
})