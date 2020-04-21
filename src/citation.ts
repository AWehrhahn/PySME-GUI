const Cite = require('citation-js')
const fs = require('fs');
const { join } = require('path');


fs.readFile(join(__dirname, "data/the-astrophysical-journal.csl"), "utf-8", (err: any, template: string) => {
    if (err) throw err;
    let config = Cite.plugins.config.get("@csl")
    config.templates.set("apj", template)
})
fs.readFile(join(__dirname, "data/nature.csl"), "utf-8", (err: any, template: string) => {
    if (err) throw err;
    let config = Cite.plugins.config.get("@csl")
    config.templates.set("nature", template)
})

var replacements: { [id: string]: string } = {}
fs.readFile(join(__dirname, "data/citation-journal-replacements.json"), "utf-8", (err: any, data: string) => {
    if (err) throw err;
    replacements = JSON.parse(data)
})

var DivCitation = document.getElementById("div-citation") as HTMLDivElement
async function show_citation(sme: SmeFile) {
    let data = await Cite.inputAsync(sme.citation_info, { forceType: "@bibtex/text" })

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

    console.log(data)

    let bib = new Cite(data)

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
    DivCitation.innerHTML = content
}