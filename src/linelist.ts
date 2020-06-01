

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
    request_linelist_from_vald(sme)
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

function request_linelist_from_vald(sme: SmeFile) {
    // This currently only send a request to VALD, but does not manage the response

    let transporter = nodemailer.createTransport({
        host: "in-v3.mailjet.com",
        port: 465,
        secure: true, // use TLS
        auth: {
            user: "68636249b84448165dd10d441c35ee72",
            pass: "f33402cb8e52deee7ae08f8d33b35de2"
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    // We indent like that to not get extra spaces
    let options = `via ftp
long format
waveunit angstrom
energyunit eV
medium vacuum
isotopic scaling on
extended waals
have rad
have stark
have waals
have lande
have term`;

    let lambda1 = sme.wran[0][0]
    let lambda2 = sme.wran[sme.wran.length - 1][sme.wran[sme.wran.length - 1].length - 1]
    let detection_threshold = 0.01
    let micro_turbulence = sme.vmic
    let effective_temperature = sme.teff
    let surface_gravity = sme.logg
    let abundances = ""

    let vald_email = ["vald@physics.uu.se", "vald3@vald.astro.univie.ac.at", "vald3@inasan.ru"]
    let text = `begin request
extract stellar
${options}
${lambda1}, ${lambda2}
${detection_threshold}, ${micro_turbulence}
${effective_temperature}, ${surface_gravity}
${abundances}
end request`;

    let message = {
        from: 'ansgar.wehrhahn@physics.uu.se',
        to: vald_email[0],
        subject: "VALD request",
        text: text
    }

    show_alert("Sending VALD Request:\n" + text, "info")

    transporter.sendMail(message, (err: any, info: any) => {
        if (err) show_error(err)
        else {
            show_alert(info.response, "info")
        }
    })

}
