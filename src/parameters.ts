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
var FieldAccrt = document.getElementById("par-accrt") as HTMLInputElement
var FieldAccwi = document.getElementById("par-accwi") as HTMLInputElement

var FieldCscaleFlag = document.getElementById("par-cscale-flag") as HTMLSelectElement
var FieldCscaleType = document.getElementById("par-cscale-type") as HTMLSelectElement
var FieldVradFlag = document.getElementById("par-vrad-flag") as HTMLSelectElement
var FieldAtmosphereFile = document.getElementById("par-atmosphere-file") as HTMLSelectElement

var FieldFitparameters = document.getElementById("par-fitparameters") as HTMLInputElement
var DivFitparameters = document.getElementById("par-fitparameters-div") as HTMLDivElement
var BtnFitparametersAdd = document.getElementById("btn-fitparameters-add") as HTMLButtonElement
var BtnFitparametersRem = document.getElementById("btn-fitparameters-rem") as HTMLButtonElement
var DivFitparametersEnd = document.getElementById("par-fitparameters-end") as HTMLDivElement

var FieldMu = document.getElementById("par-mu") as HTMLInputElement
var DivMu = document.getElementById("par-mu-div") as HTMLDivElement
var BtnMuAdd = document.getElementById("btn-mu-add") as HTMLButtonElement
var BtnMuRem = document.getElementById("btn-mu-rem") as HTMLButtonElement
var DivMUEnd = document.getElementById("par-mu-end") as HTMLDivElement
//TODO Autocomplete for fitparameters


var BtnAbundAsplund2009 = document.getElementById("btn-abund-asplund2009") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "asplund2009"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["type"] = "H-12"
    sme["abund/info"]["monh"] = 0
    update_abundance(sme)
})

var BtnAbundGrevesse2007 = document.getElementById("btn-abund-grevesse2007") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "grevesse2007"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["type"] = "H-12"
    sme["abund/info"]["monh"] = 0
    update_abundance(sme)
})

var BtnAbundLodders2003 = document.getElementById("btn-abund-lodders2003") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "lodders2003"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["type"] = "H-12"
    sme["abund/info"]["monh"] = 0
    update_abundance(sme)
})

function update_abundance(sme: SmeFile) {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let field = document.getElementById(`par-abund-input-${element}`) as HTMLInputElement
        let value = sme["abund/pattern"][i]
        if (isNaN(value)) value = -99
        field.value = value
    }
}

// All the elements that can be used in SME (the first 100)
var elements = [
    "H", "He",
    "Li", "Be", "B", "C", "N", "O", "F", "Ne",
    "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
    "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe",
    "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se",
    "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo",
    "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
    "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce",
    "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy",
    "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W",
    "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb",
    "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
    "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf",
    "Es",]

// index of each element in the pattern data array
var elements_dict: { [id: string]: number } = {}
for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    elements_dict[element] = i
}

for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let field = document.getElementById(`par-abund-input-${element}`)
    field.addEventListener("change", (event: any) => {
        let i = elements_dict[element]
        let value = Number(event.target.value)
        sme["abund/pattern"][i] = value
    })
}

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
    load_nlte_files()
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
    FieldAccrt.value = sme.accrt
    FieldAccwi.value = sme.accwi

    FieldCscaleFlag.value = sme.cscale_flag
    FieldCscaleType.value = sme.cscale_type
    FieldVradFlag.value = sme.vrad_flag

    FieldH2broad.value = sme.h2broad

    // Fitparameters
    for (let i = 0; i < sme.fitparameters.length; i++) {
        const element = sme.fitparameters[i];
        if (i >= get_n_fitparameters_fields()) {
            BtnFitparametersAdd.click()
        }
        let field = get_fitparamters_field(i);
        field.value = element
    }
    while (sme.fitparameters.length < get_n_fitparameters_fields()) {
        BtnFitparametersRem.click()
    }

    // Mu
    for (let i = 0; i < sme.mu.length; i++) {
        const element = sme.mu[i];
        if (i >= get_n_mu_fields()) {
            BtnMuAdd.click()
        }
        let field = get_mu_field(i);
        field.value = element
        field.dispatchEvent(new Event("change"))
    }
    while (sme.mu.length < get_n_mu_fields()) {
        BtnMuRem.click()
    }

    let atmo_file: string = sme["atmo/info"].source
    add_atmosphere_file(atmo_file)
    FieldAtmosphereFile.value = sme["atmo/info"].source

    update_abundance(sme)
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
    sme.h2broad = Boolean(event.target.value)
})
FieldAccrt.addEventListener("change", (event: any) => {
    sme.accrt = Number(event.target.value)
})
FieldAccwi.addEventListener("change", (event: any) => {
    sme.accwi = Number(event.target.value)
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



// Fitparameters
FieldFitparameters.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.fitparameters[0] = value
})

function get_n_fitparameters_fields() {
    return DivFitparameters.childElementCount - 2
}

function get_fitparamters_field(index: number) {
    if (index >= get_n_fitparameters_fields()) {
        throw "index out of range"
    }
    // There is an additional child after the first one
    if (index != 0) index += 1
    index += 3
    return DivFitparameters.childNodes[index] as HTMLInputElement
}


BtnFitparametersAdd.addEventListener("click", (event: any) => {
    let child = document.createElement("input")
    // The index of this element will be equal to the number of fields at this moment
    let i = get_n_fitparameters_fields()
    child.classList.add("form-control")
    child.addEventListener("change", (event: any) => {
        var value: string = event.target.value
        sme.fitparameters[i] = value
    })
    DivFitparameters.insertBefore(child, DivFitparametersEnd)
    try {
        if (sme.fitparameters.length < get_n_fitparameters_fields()) {
            sme.fitparameters.push("")
        }
    } catch (err) { console.log(err) }
})


BtnFitparametersRem.addEventListener("click", (event: any) => {
    if (DivFitparameters.childElementCount > 3) {
        // If there are any fields to remove
        let j = DivFitparameters.childNodes.length
        // Move to the last input field
        j -= 3
        let child = DivFitparameters.childNodes[j]
        DivFitparameters.removeChild(child)
        try {
            if (sme.fitparameters.length > get_n_fitparameters_fields()) {
                sme.fitparameters.pop()
            }
        } catch (err) { console.log(err) }
    }
})

// Mu Buttons
FieldMu.addEventListener("change", (event) => {
    let field = event.target as HTMLInputElement
    var value = Number(field.value)
    if (value > 1 || value < 0) {
        field.classList.add("is-invalid")
    } else {
        field.classList.remove("is-invalid")
        sme.mu[0] = value
    }
})

function get_n_mu_fields() {
    return DivMu.childElementCount - 2
}

function get_mu_field(index: number) {
    if (index >= get_n_mu_fields()) {
        throw "index out of range"
    }
    // There is an additional child after the first one
    if (index != 0) index += 1
    index += 3
    return DivMu.childNodes[index] as HTMLInputElement
}


BtnMuAdd.addEventListener("click", (event: any) => {
    let child = document.createElement("input")
    // The index of this element will be equal to the number of fields at this moment
    let i = get_n_mu_fields()
    child.classList.add("form-control")
    child.type = "number"
    child.step = "any"
    child.min = "0"
    child.max = "1"
    child.addEventListener("change", (event) => {
        let field = event.target as HTMLInputElement
        var value = Number(field.value)
        if (value > 1 || value < 0) {
            field.classList.add("is-invalid")
        } else {
            field.classList.remove("is-invalid")
            sme.mu[i] = value
        }
    })
    DivMu.insertBefore(child, DivMUEnd)
    try {
        if (sme.mu.length < get_n_mu_fields()) {
            sme.mu.push(NaN)
        }
    } catch (err) { console.log(err) }
})


BtnMuRem.addEventListener("click", (event: any) => {
    if (DivMu.childElementCount > 3) {
        // If there are any fields to remove
        let j = DivMu.childNodes.length
        // Move to the last input field
        j -= 3
        let child = DivMu.childNodes[j]
        DivMu.removeChild(child)
        try {
            if (sme.mu.length > get_n_mu_fields()) {
                sme.mu.pop()
            }
        } catch (err) { console.log(err) }
    }
})