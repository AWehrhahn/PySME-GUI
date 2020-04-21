//TODO: do this for every field

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

var FieldFitparameters = document.getElementById("par-fitparameters") as HTMLInputElement
var FieldMu = document.getElementById("par-mu") as HTMLInputElement



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

FieldFitparameters.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.fitparameters = value.split(",")
})
FieldMu.addEventListener("change", (event: any) => {
    var value: string = event.target.value
    sme.mu = value.split(",").map(Number)
})
