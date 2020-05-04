addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail
    show_linelist(sme)
})


var ButtonLinelistLoad = document.getElementById("btn-linelist-load") as HTMLButtonElement
ButtonLinelistLoad.addEventListener("click", async (event) => {
    console.log("load Linelist")
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        try {
            sme = await load_new_linelist(sme, fname)
            show_linelist(sme)
            plot_sme(sme)
        } catch (err) {
            console.error(err)
        }
    }
})

function show_linelist(sme: SmeFile) {
    $(document).ready(function () {
        $('#table-linelist').DataTable({
            destroy: true,
            data: sme["linelist/data"],
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
    sme["linelist/data"] = json.data
    sme["linelist/info"] = json.info
    return sme
}