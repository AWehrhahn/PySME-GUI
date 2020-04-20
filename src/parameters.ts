//TODO: do this for every field

var FieldTeff: any = document.getElementById("par-teff")
var FieldLogg: any = document.getElementById("par-logg")
var FieldMonh: any = document.getElementById("par-monh")
var FieldVmic: any = document.getElementById("par-vmic")
var FieldVmac: any = document.getElementById("par-vmac")
var FieldVsini: any = document.getElementById("par-vsini")
var FieldGamma6: any = document.getElementById("par-gamma6")
var FieldH2broad: any = document.getElementById("par-h2broad")


var FieldCscaleFlag: any = document.getElementById("par-cscale-flag")
var FieldCscaleType: any = document.getElementById("par-cscale-type")
var FieldVradFlag: any = document.getElementById("par-vrad-flag")

var FieldFitparameters: any = document.getElementById("par-fitparameters")
var FieldMu: any = document.getElementById("par-mu")



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
