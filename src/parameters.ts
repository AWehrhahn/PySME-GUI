//TODO: do this for every field
const homedir = require('os').homedir();
const { join } = require('path');
const fs = require('fs');
const untildify = require('untildify');



var FieldTeff = document.getElementById("par-teff") as HTMLInputElement
var FieldLogg = document.getElementById("par-logg") as HTMLInputElement
var FieldMonh = document.getElementById("par-monh") as HTMLInputElement
var FieldVmic = document.getElementById("par-vmic") as HTMLInputElement
var FieldVmac = document.getElementById("par-vmac") as HTMLInputElement
var FieldVsini = document.getElementById("par-vsini") as HTMLInputElement
var FieldGamma6 = document.getElementById("par-gamma6") as HTMLInputElement
var FieldH2broad = document.getElementById("par-h2broad") as HTMLInputElement


var FieldCscaleFlag = document.getElementById("par-cscale-flag") as HTMLSelectElement
var FieldCscaleType = document.getElementById("par-cscale-type") as HTMLSelectElement
var FieldVradFlag = document.getElementById("par-vrad-flag") as HTMLSelectElement
var FieldAtmosphereFile = document.getElementById("par-atmosphere-file") as HTMLSelectElement

var FieldFitparameters = document.getElementById("par-fitparameters") as HTMLInputElement
var FieldMu = document.getElementById("par-mu") as HTMLInputElement

async function load_atmosphere_files() {
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

var config: any;
var atmo_files: string[] = [];
fs.readFile(join(homedir, ".sme", "config.json"), "utf-8", (err: any, data: string) => {
    config = JSON.parse(data)
    load_atmosphere_files()
});

var ButtonAtmosphereAdd = document.getElementById("btn-atmosphere-add") as HTMLButtonElement
ButtonAtmosphereAdd.addEventListener("click", async (event) => {
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        try {
            add_atmosphere_file(fname)
            FieldAtmosphereFile.value = fname
            sme["atmo/info"].source = fname
        } catch (err) {
            console.error(err)
        }
    }
})

async function load_parameter_values(sme: SmeFile) {
    // Load all values from sme and display them
    FieldTeff.value = sme.teff
    FieldLogg.value = sme.logg
    FieldMonh.value = sme["abund/info"]["monh"]
    FieldVmic.value = sme.vmic
    FieldVmac.value = sme.vmac
    FieldVsini.value = sme.vsini
    FieldGamma6.value = sme.gam6

    FieldCscaleFlag.value = sme.cscale_flag
    FieldCscaleType.value = sme.cscale_type
    FieldVradFlag.value = sme.vrad_flag

    FieldH2broad.checked = sme.h2broad

    // Fitparameters are comma seperated text
    // TODO: is there a better option?
    FieldFitparameters.value = sme.fitparameters.join(", ")
    FieldMu.value = sme.mu.join(", ")

    let atmo_file: string = sme["atmo/info"].source
    add_atmosphere_file(atmo_file)
    FieldAtmosphereFile.value = sme["atmo/info"].source

}

// React to the values being changed
FieldTeff.addEventListener("change", (event: any) => {
    sme.teff = Number(event.target.value)
})
FieldLogg.addEventListener("change", (event: any) => {
    sme.logg = Number(event.target.value)
})
FieldMonh.addEventListener("change", (event: any) => {
    sme["abund/info"]["monh"] = Number(event.target.value)
})
FieldVmic.addEventListener("change", (event: any) => {
    sme.vmic = Number(event.target.value)
})
FieldVmac.addEventListener("change", (event: any) => {
    sme.vmac = Number(event.target.value)
})
FieldVsini.addEventListener("change", (event: any) => {
    sme.vsini = Number(event.target.value)
})
FieldGamma6.addEventListener("change", (event: any) => {
    sme.gam6 = Number(event.target.value)
})
FieldH2broad.addEventListener("change", (event: any) => {
    sme.h2broad = event.target.checked
})

FieldCscaleFlag.addEventListener("change", (event: any) => {
    sme.cscale_flag = event.target.value
})
FieldCscaleType.addEventListener("change", (event: any) => {
    sme.cscale_type = event.target.value
})
FieldVradFlag.addEventListener("change", (event: any) => {
    sme.vrad_flag = event.target.value
})
FieldAtmosphereFile.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    sme["atmo/info"].source = target.value
})

FieldFitparameters.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.fitparameters = value.split(",")
})
FieldMu.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.mu = value.split(",").map(Number)
})
