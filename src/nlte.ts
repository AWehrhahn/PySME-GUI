var BtnNlteAdd = document.getElementById("btn-nlte-add")
var DivNlte = document.getElementById("div-nlte")

function get_available_elements() {
    return elements
}

function remove_nlte_element(element: string) {
    if (sme) {
        let elements: string[] = sme["nlte/info"].elements
        let idx = elements.indexOf(element)
        if (idx > -1) {
            elements.splice(idx, 1)
        }
    }
}

function add_nlte_element(element: string, datafile: string) {
    if (sme) {
        let elements = sme["nlte/info"].elements
        let grids = sme["nlte/info"].grids
        elements.push(element)
        grids[element] = datafile
    }
}

function set_nlte_element(element: string, datafile: string) {
    if (sme) {
        let elements = sme["nlte/info"].elements
        if (!elements.includes(element)) {
            add_nlte_element(element, datafile)
        } else {
            let grids = sme["nlte/info"].grids
            grids[element] = datafile
        }
    }
}

async function load_nlte_files() {
    // Add files that are available from the server
    let nlte_file = join(homedir, ".sme", config["data.pointers.nlte_grids"])
    let data: string = fs.readFileSync(nlte_file, "utf-8")
    let json = JSON.parse(data)
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            add_nlte_file(key)
        }
    }

    // Add atmosphere files in the correct folder
    let misc_files_dir = untildify(config["data.nlte_grids"])
    var misc_files = fs.readdirSync(misc_files_dir, { withFileTypes: true });
    for (let index = 0; index < misc_files.length; index++) {
        const element = misc_files[index];
        if (element.isFile()) {
            add_nlte_file(element.name)
        }
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


function create_nlte_field(element: string) {
    let child = document.createElement("div")
    child.classList.add("input-group", "input-group-sm", "mb-1")

    let select_element = document.createElement("select")
    select_element.classList.add("custom-select", "input-group-width-small")
    child.appendChild(select_element)

    let available_elements = get_available_elements()
    for (const key in available_elements) {
        if (available_elements.hasOwnProperty(key)) {
            const elem = available_elements[key];
            let opt = document.createElement("option")
            opt.value = elem
            opt.innerHTML = elem
            select_element.appendChild(opt)
        }
    }

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
        if (sme) {
            let elements: string[] = sme["nlte/info"].elements
            let idx = elements.indexOf(element)
            if (idx > -1) {
                elements.splice(idx, 1)
            }
        }
        // Remove this whole element from the parent
        child.parentNode.removeChild(child)

        // Remove the file selector
        let idx = nlte_file_selectors.indexOf(select_file)
        if (idx > -1) {
            nlte_file_selectors.splice(idx, 1)
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
        remove_nlte_element(wasSelected)
        wasSelected = select_element.value
        add_nlte_element(select_element.value, select_file.value)
    })

    select_file.addEventListener("change", () => {
        set_nlte_element(select_element.value, select_file.value)
    })

    return child
}

BtnNlteAdd.addEventListener("click", (event) => {
    let child = create_nlte_field("Fe")
    DivNlte.insertBefore(child, BtnNlteAdd)
})