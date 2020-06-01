

addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    if (!updated.length || updated.includes("linelist")) {
        show_linelist(sme)
    }
})


var ButtonLinelistLoad = document.getElementById("btn-linelist-load") as HTMLButtonElement
ButtonLinelistLoad.addEventListener("click", async (event) => {
    console.log("load Linelist")
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        try {
            sme = await load_new_linelist(sme, fname)
            cast_load_event(sme, "linelist")
        } catch (err) {
            console.error(err)
        }
    }
})

var ButtonLinelistRequestVald = document.getElementById("btn-linelist-request-vald") as HTMLButtonElement
ButtonLinelistRequestVald.addEventListener("click", (event) => {
    //TODO
})

function show_linelist(sme: SmeFile) {
    $(document).ready(function () {
        $('#table-linelist').DataTable({
            destroy: true,
            responsive: {
                details: {
                    type: 'column',
                    target: 'tr'
                }
            },
            data: sme.linelist.data,
            columns: [
                { title: 'species', data: 'species' },
                { title: 'wlcent', data: 'wlcent' },
                { title: 'excit', data: 'excit' },
                { title: 'gflog', data: 'gflog' },
                { title: 'gamrad', data: 'gamrad' },
                { title: 'gamqst', data: 'gamqst' },
                { title: 'gamvw', data: 'gamvw' },
                { title: 'lande', data: 'lande' },
                { title: 'depth', data: 'depth' }
            ]
        });
    });
}

async function load_new_linelist(sme: SmeFile, linelist_file: string) {
    var tmpout = tmp.fileSync({ postfix: ".json" });
    var success = await call_python("load_new_linelist.py", [linelist_file, tmpout.name, "--format=VALD"])
    var data = fs.readFileSync(tmpout.name, { encoding: "utf-8" })
    var json = JSON.parse(data)
    sme.linelist.data = json.data
    sme.linelist.header = json.info
    return sme
}
