//TODO: do this for every field
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


addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    if (!updated.length || updated.includes("parameters")) {
        load_parameter_values(sme)
    }
})


async function load_parameter_values(sme: SmeFile) {
    // Load all values from sme and display them
    FieldTeff.value = String(sme.header.teff)
    FieldLogg.value = String(sme.header.logg)
    FieldMonh.value = String(sme.abund.header.monh)
    FieldVmic.value = String(sme.header.vmic)
    FieldVmac.value = String(sme.header.vmac)
    FieldVsini.value = String(sme.header.vsini)
    FieldGamma6.value = String(sme.header.gam6)
    FieldAccrt.value = String(sme.header.accrt)
    FieldAccwi.value = String(sme.header.accwi)

    FieldCscaleFlag.value = sme.header.cscale_flag
    FieldCscaleType.value = sme.header.cscale_type
    FieldVradFlag.value = sme.header.vrad_flag

    FieldH2broad.value = String(sme.header.h2broad)

    // Fitparameters
    for (let i = 0; i < sme.header.fitparameters.length; i++) {
        const element = sme.header.fitparameters[i];
        if (i >= get_n_fitparameters_fields()) {
            BtnFitparametersAdd.click()
        }
        let field = get_fitparamters_field(i);
        field.value = element
    }
    while (sme.header.fitparameters.length < get_n_fitparameters_fields()) {
        BtnFitparametersRem.click()
        if (get_n_fitparameters_fields() == 1) break;
    }

    // Mu
    for (let i = 0; i < sme.header.mu.length; i++) {
        const element = sme.header.mu[i];
        if (i >= get_n_mu_fields()) {
            BtnMuAdd.click()
        }
        let field = get_mu_field(i);
        field.value = String(element)
        field.dispatchEvent(new Event("change"))
    }
    while (sme.header.mu.length < get_n_mu_fields()) {
        BtnMuRem.click()
        if (get_n_mu_fields() == 1) break;
    }
}

// React to the values being changed
FieldTeff.addEventListener("change", (event: any) => {
    sme.header.teff = Number(event.target.value)
})
FieldLogg.addEventListener("change", (event: any) => {
    sme.header.logg = Number(event.target.value)
})
FieldMonh.addEventListener("change", (event: any) => {
    sme.abund.header.monh = Number(event.target.value)
})
FieldVmic.addEventListener("change", (event: any) => {
    sme.header.vmic = Number(event.target.value)
})
FieldVmac.addEventListener("change", (event: any) => {
    sme.header.vmac = Number(event.target.value)
})
FieldVsini.addEventListener("change", (event: any) => {
    sme.header.vsini = Number(event.target.value)
})
FieldGamma6.addEventListener("change", (event: any) => {
    sme.header.gam6 = Number(event.target.value)
})
FieldH2broad.addEventListener("change", (event: any) => {
    sme.header.h2broad = Boolean(event.target.value)
})
FieldAccrt.addEventListener("change", (event: any) => {
    sme.header.accrt = Number(event.target.value)
})
FieldAccwi.addEventListener("change", (event: any) => {
    sme.header.accwi = Number(event.target.value)
})

FieldCscaleFlag.addEventListener("change", (event: any) => {
    sme.header.cscale_flag = event.target.value
})
FieldCscaleType.addEventListener("change", (event: any) => {
    sme.header.cscale_type = event.target.value
})
FieldVradFlag.addEventListener("change", (event: any) => {
    sme.header.vrad_flag = event.target.value
})

// Fitparameters
FieldFitparameters.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.header.fitparameters[0] = value
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
        sme.header.fitparameters[i] = value
    })
    DivFitparameters.insertBefore(child, DivFitparametersEnd)
    try {
        if (sme.header.fitparameters.length < get_n_fitparameters_fields()) {
            sme.header.fitparameters.push("")
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
            if (sme.header.fitparameters.length > get_n_fitparameters_fields()) {
                sme.header.fitparameters.pop()
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
        sme.header.mu[0] = value
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
            sme.header.mu[i] = value
        }
    })
    DivMu.insertBefore(child, DivMUEnd)
    try {
        if (sme.header.mu.length < get_n_mu_fields()) {
            sme.header.mu.push(NaN)
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
            if (sme.header.mu.length > get_n_mu_fields()) {
                sme.header.mu.pop()
            }
        } catch (err) { console.log(err) }
    }
})