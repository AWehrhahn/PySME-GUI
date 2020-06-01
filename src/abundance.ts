
addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    console.log(updated)
    if (!updated.length || updated.includes("abundance")) {
        update_abundance(sme)
    }
})

var BtnAbundAsplund2009 = document.getElementById("btn-abund-asplund2009") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "asplund2009"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["format"] = "H=12"
    sme["abund/info"]["monh"] = 0
    cast_load_event(sme, "abundance")
})

var BtnAbundGrevesse2007 = document.getElementById("btn-abund-grevesse2007") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "grevesse2007"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["format"] = "H=12"
    sme["abund/info"]["monh"] = 0
    cast_load_event(sme, "abundance")
})

var BtnAbundLodders2003 = document.getElementById("btn-abund-lodders2003") as HTMLButtonElement
BtnAbundAsplund2009.addEventListener("click", async (event) => {
    let tmpout = tmp.fileSync({ postfix: ".dat" });
    let success = await call_python("get_abundance_values.py", [tmpout.name, "lodders2003"])
    var content: Buffer = fs.readFileSync(tmpout.name, { encoding: null })
    var abund = new Float64Array(content.buffer, content.byteOffset, content.length / Float64Array.BYTES_PER_ELEMENT)
    sme["abund/pattern"] = abund
    sme["abund/info"]["format"] = "H=12"
    sme["abund/info"]["monh"] = 0
    cast_load_event(sme, "abundance")
})

function update_abundance(sme: SmeFile) {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let field = document.getElementById(`par-abund-input-${element}`) as HTMLInputElement
        let value = sme["abund/pattern"][i]
        if (isNaN(value)) value = -99
        field.value = String(value)
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