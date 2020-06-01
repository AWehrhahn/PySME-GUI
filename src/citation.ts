
addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    // Citations can be updated from any event
    show_citation(sme)
})

async function collect_citations(sme: SmeFile) {
    let data = await Cite.inputAsync(sme.header.citation_info, { forceType: "@bibtex/text" })

    for (const key in sme) {
        if (sme.hasOwnProperty(key)) {
            const element = (sme as { [id: string]: any })[key];
            if (typeof element == "object") {
                if (element.hasOwnProperty("citation_info")) {
                    let temp = await Cite.inputAsync(element["citation_info"], { forceType: "@bibtex/text" })
                    for (let i = 0; i < temp.length; i++) {
                        const element = temp[i];
                        data.push(element)
                    }
                }
            }
        }
    }

    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element.hasOwnProperty("container-title")) {
            var journal: string = element["container-title"]
            if (journal.startsWith('\\')) {
                var key = journal.substr(1)
                if (replacements.hasOwnProperty(key)) {
                    data[index]["container-title"] = replacements[key]
                }
            }
        }
    }

    let bib = new Cite(data)
    return bib;
}

function generate_citations_html(bib: any) {
    let content = bib.format("bibliography", {
        format: "html", template: "apj",
        prepend(entry: any) {
            if (entry.hasOwnProperty("DOI")) {
                var link = `https://www.doi.org/${entry.DOI}`
            } else {
                // Add other URL properties here
            }
            if (link) {
                return `<a href="${link}" target="_blank">`
            } else {
                return "<a>"
            }
        },
        append(entry: any) {
            return `</a>`
        }
    })
    return content
}

function generate_citations_bibtex(bib: any) {
    let content = bib.format("bibtex")
    return content
}

function generate_citations_text(bib: any) {
    let content = bib.format("bibliography", {
        template: "apj",
    })
    return content
}

async function export_citations(sme: SmeFile, generator: any) {
    var out = await dialog.showSaveDialog({ properties: ["showOverwriteConfirmation"] })
    if (!out.canceled) {
        var fname = out.filePath
        let bib = await collect_citations(sme)
        let content = generator(bib)
        fs.writeFile(fname, content, (err: any) => {
            if (err) throw err;
            console.log("Citation saved")
        })
    } else {
        console.log("User did not select a file")
    }
}

var BtnExportText = document.getElementById("btn-citation-export-text") as HTMLButtonElement
BtnExportText.addEventListener("click", async (event) => {
    export_citations(sme, generate_citations_text)
})

var BtnExportBibtex = document.getElementById("btn-citation-export-bibtex") as HTMLButtonElement
BtnExportBibtex.addEventListener("click", (event) => {
    export_citations(sme, generate_citations_bibtex)
})

fs.readFile(join(__dirname, "data/the-astrophysical-journal.csl"), "utf-8", (err: any, template: string) => {
    if (err) throw err;
    let config = Cite.plugins.config.get("@csl")
    config.templates.set("apj", template)
})
// fs.readFile(join(__dirname, "data/nature.csl"), "utf-8", (err: any, template: string) => {
//     if (err) throw err;
//     let config = Cite.plugins.config.get("@csl")
//     config.templates.set("nature", template)
// })

var replacements: { [id: string]: string } = {}
fs.readFile(join(__dirname, "data/citation-journal-replacements.json"), "utf-8", (err: any, data: string) => {
    if (err) throw err;
    replacements = JSON.parse(data)
})

var DivCitation = document.getElementById("div-citation") as HTMLDivElement
async function show_citation(sme: SmeFile) {
    let bib = await collect_citations(sme)
    let content = generate_citations_html(bib)
    DivCitation.innerHTML = content
}