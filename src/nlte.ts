var BtnNlteAdd = document.getElementById("btn-nlte-add")
var DivNlte = document.getElementById("div-nlte")

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

addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    if (!updated.length || updated.includes("nlte")) {
        load_nlte_values(sme)
    }
})

addEventListener("config_loaded", (event: any) => {
    let config: Config = event.detail
    load_nlte_files(config)
})

function get_available_elements() {
    let used_elements: string[] = [];
    if (sme) {
        used_elements = sme.nlte.header.elements
    } else {
        used_elements = []
    }
    let result = get_all_elements().filter(item => !used_elements.includes(item))
    return result
}

function get_all_elements() {
    return elements
}

function remove_nlte_element(element: string) {
    if (sme) {
        let elements: string[] = sme.nlte.header.elements
        let idx = elements.indexOf(element)
        if (idx > -1) {
            elements.splice(idx, 1)
        }
        delete sme.nlte.header.grids[element]
    }
}

function add_nlte_element(element: string, datafile: string) {
    if (sme) {
        let elements = sme.nlte.header.elements
        let grids = sme.nlte.header.grids
        if (!elements.includes(element)) {
            elements.push(element)
        }
        grids[element] = datafile
    }
}

function set_nlte_element(element: string, datafile: string) {
    if (sme) {
        let elements = sme.nlte.header.elements
        if (!elements.includes(element)) {
            add_nlte_element(element, datafile)
        } else {
            let grids = sme.nlte.header.grids
            grids[element] = datafile
        }
    }
}

async function load_nlte_files(config: Config) {
    // Add files that are available on the server and in the local cache
    let tmpout = tmp.fileSync({ postfix: ".json" });
    let success = await call_python("get_datafiles.py", [tmpout.name, "nlte"])
    let data: string = fs.readFileSync(tmpout.name, { encoding: "utf-8" })
    let json = JSON.parse(data)
    // add the files to the internal list
    for (let i = 0; i < json.length; i++) {
        const element = json[i];
        add_nlte_file(element)
    }
}

function add_nlte_file(fname: string) {
    if (!nlte_files.includes(fname)) {
        nlte_files.push(fname)
        for (const key in nlte_file_selectors) {
            if (nlte_file_selectors.hasOwnProperty(key)) {
                const select_file = nlte_file_selectors[key];
                let opt = document.createElement("option")
                opt.value = fname
                opt.innerHTML = fname
                select_file.appendChild(opt)
            }
        }
    }
}

var nlte_files: string[] = [];
var nlte_file_selectors: HTMLSelectElement[] = [];
var nlte_element_selectors: HTMLSelectElement[] = [];
var nlte_input_groups: HTMLDivElement[] = [];


function create_nlte_field(element?: string, datafile?: string) {
    let child = document.createElement("div")
    child.classList.add("input-group", "input-group-sm", "mb-1")

    let select_element = document.createElement("select")
    select_element.classList.add("custom-select", "input-group-width-small")
    child.appendChild(select_element)

    let available_elements = get_all_elements()
    for (const key in available_elements) {
        if (available_elements.hasOwnProperty(key)) {
            const elem = available_elements[key];
            let opt = document.createElement("option")
            opt.value = elem
            opt.innerHTML = elem
            select_element.appendChild(opt)
        }
    }
    if (element) {
        select_element.value = element
    } else {
        select_element.value = get_available_elements()[0]
    }

    nlte_element_selectors.push(select_element)

    let select_file = document.createElement("select")
    select_file.classList.add("custom-select")
    child.appendChild(select_file)

    for (const key in nlte_files) {
        if (nlte_files.hasOwnProperty(key)) {
            const elem = nlte_files[key];
            let opt = document.createElement("option")
            opt.value = elem
            opt.innerHTML = elem
            select_file.appendChild(opt)
        }
    }

    if (datafile) {
        if (!nlte_files.includes(datafile)) {
            add_nlte_file(datafile)
        }
        select_file.value = datafile
    }

    nlte_file_selectors.push(select_file)

    let append = document.createElement("div")
    append.classList.add("input-group-append")
    child.appendChild(append)

    let button = document.createElement("button")
    button.classList.add("btn", "btn-outline-secondary")
    button.type = "button"
    button.innerText = "-"
    append.appendChild(button)

    let btn_custom = document.createElement("button")
    btn_custom.classList.add("btn", "btn-outline-secondary")
    btn_custom.type = "button"
    btn_custom.innerText = "Add NLTE Grid"
    append.appendChild(btn_custom)

    button.addEventListener("click", (event) => {
        // Remove the NLTE from the sme object
        remove_nlte_element(select_element.value)
        // Remove this whole element from the parent
        child.parentNode.removeChild(child)

        // Remove the file selector
        let idx = nlte_file_selectors.indexOf(select_file)
        if (idx > -1) {
            nlte_file_selectors.splice(idx, 1)
        }
        // and the element selector
        idx = nlte_element_selectors.indexOf(select_element)
        if (idx > -1) {
            nlte_element_selectors.splice(idx, 1)
        }
        idx = nlte_input_groups.indexOf(child)
        if (idx > -1) {
            nlte_input_groups.splice(idx, 1)
        }

    })

    btn_custom.addEventListener("click", async (event) => {
        var out = await dialog.showOpenDialog({ properties: ["openFile"] })
        if (!out.canceled) {
            var fname = out.filePaths[0];
            try {
                add_nlte_file(fname)
                select_file.value = fname
                set_nlte_element(select_element.value, fname)
            } catch (err) {
                console.error(err)
            }
        }
    })

    let wasSelected = select_element.value

    select_element.addEventListener("change", () => {
        let other_elements = get_available_elements()
        if (!other_elements.includes(select_element.value)) {
            select_element.value = wasSelected
        } else {
            remove_nlte_element(wasSelected)
            wasSelected = select_element.value
            add_nlte_element(select_element.value, select_file.value)
        }
    })

    select_file.addEventListener("change", () => {
        set_nlte_element(select_element.value, select_file.value)
    })

    add_nlte_element(select_element.value, select_file.value)

    nlte_input_groups.push(child)
    return child
}

BtnNlteAdd.addEventListener("click", (event) => {
    let child = create_nlte_field()
    DivNlte.insertBefore(child, BtnNlteAdd)
})

function load_nlte_values(sme: SmeFile) {
    console.log("Load NLTE values")
    // remove all NLTE fields
    for (let i = 0; i < nlte_input_groups.length; i++) {
        console.log("remove child " + i)
        const child = nlte_input_groups[i];
        DivNlte.removeChild(child)
    }

    console.log("Number of NLTE elements: " + sme.nlte.header.elements.length)
    let nelements = sme.nlte.header.elements.length
    for (let i = 0; i < nelements; i++) {
        const element = sme.nlte.header.elements[i];
        const datafile = sme.nlte.header.grids[element];
        let child = create_nlte_field(element, datafile)
        DivNlte.insertBefore(child, BtnNlteAdd)
    }
    console.log("Finished loading NLTE values")
}