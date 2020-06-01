// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = require("jquery");
var dt = require('datatables.net')();
require('datatables.net-bs4')();
require('datatables.net-responsive-bs4')();
require("popper.js")
require("bootstrap");

const { dialog } = require('electron').remote
var tmp = require('tmp');
const chokidar = require('chokidar');
const { Table } = require("apache-arrow");
const homedir = require('os').homedir();
const { join } = require('path');
const fs = require('fs');
const untildify = require('untildify');
var Plotly = require("plotly.js")
const { spawn } = require('child_process');
const Cite = require('citation-js');
var Base64 = require('base64-arraybuffer');


// This section is from the template: https://startbootstrap.com/themes/sb-admin-2/
// Toggle the side navigation
$("#sidebarToggle, #sidebarToggleTop").on('click', function (e: any) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
        $('.sidebar .collapse').collapse('hide');
    };
});


// Close any open menu accordions when window is resized below 768px
$(window).resize(function () {
    if ($(window).width() < 768) {
        $('.sidebar .collapse').collapse('hide');
    };
});

// Prevent the content wrapper from scrolling when the fixed side navigation hovered over
$('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e: any) {
    if ($(window).width() > 768) {
        var e0 = e.originalEvent,
            delta = e0.wheelDelta || -e0.detail;
        this.scrollTop += (delta < 0 ? 1 : -1) * 30;
        e.preventDefault();
    }
});

// Scroll to top button appear
$(document).on('scroll', function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
        $('.scroll-to-top').fadeIn();
    } else {
        $('.scroll-to-top').fadeOut();
    }
});

// Smooth scrolling using jQuery easing
$(document).on('click', 'a.scroll-to-top', function (e: any) {
    var $anchor = $(this);
    $('html, body').stop().animate({
        scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
});
$("#sidebarToggle").click()


tmp.setGracefulCleanup();

class SmeError {
    constructor(public message: string) {
    }
}
class EndianError extends SmeError { }
class IdlError extends SmeError { }

function create_empty_sme_structure() {
    let struct: SmeFile = {
        header: {
            vrad: new Float64Array(),
            cscale: [],
            wran: [],
            citation_info: "",
            teff: 5000,
            logg: 4,
            vmic: 1,
            vmac: 1,
            vsini: 1,
            id: "DEFAULT",
            object: "",
            version: "PySME-GUI",
            vrad_flag: "whole",
            cscale_flag: "constant",
            cscale_type: "mask",
            normalize_by_continuum: true,
            specific_intensities_only: false,
            gam6: 1,
            h2broad: true,
            accwi: 0.1,
            accrt: 0.1,
            mu: [0.1, 0.5, 1],
            fitparameters: [],
            ipres: 0,
        },
        abund: {
            header: {
                format: "H=12",
                monh: 0,
                citation_info: "",
            },
            data: new Float64Array(99),
        },
        wave: null,
        spec: null,
        uncs: null,
        mask: null,
        synth: null,
        cont: null,
        linelist: {
            header: {
                format: "short",
                medium: "vac",
                citation_info: "",
            },
            data: {}
        },
        atmo: {
            header: {
                teff: 5000,
                logg: 4,
                vturb: 0,
                lonh: 0,
                source: "",
                method: "grid",
                geom: "PP",
                radius: new Float64Array(),
                height: new Float64Array(),
                opflag: [],
                wlstd: 5000,
                depth: "RHOX",
                interp: "TAU",
                citation_info: "",
                abund_format: "H=12",
                monh: 0
            },
            tau: new Float64Array(),
            rhox: new Float64Array(),
            temp: new Float64Array(),
            rho: new Float64Array(),
            xna: new Float64Array(),
            xne: new Float64Array(),
            abund: new Float64Array(99),
        },
        nlte: {
            header: {
                citation_info: "",
                elements: [],
                grids: {},
                subgrid_size: [2, 2, 2, 2],
                flags: new Int8Array()
            }
        },
        system_info: {
            header: {}
        }
    }
    return struct
}

var sme = create_empty_sme_structure();



var config: { [id: string]: any } = {};
fs.readFile(join(homedir, ".sme", "config.json"), "utf-8", (err: any, data: string) => {
    config = JSON.parse(data)
    dispatchEvent(new CustomEvent("config_loaded", { detail: config }))
});


async function synthesize_spectrum(sme: SmeFile) {
    var script_file = join(__dirname, "scripts/synthesize_spectrum.py")
    var tmpin = tmp.fileSync({ postfix: ".sme" });
    var tmpout = tmp.fileSync({ postfix: ".sme" });
    var tmplog = tmp.fileSync({ postfix: ".log", keep: true });

    // Watch the logfile
    console.log("Watching file: " + tmplog.name)
    const watcher = chokidar.watch(tmplog.name, { usePolling: true })
    watcher.on('change', update_log)

    var promise = new Promise<SmeFile>((resolve, reject) => {
        save_file(tmpin.name, sme).then(() => {
            call_python("synthesize_spectrum.py", [tmpin.name, tmpout.name, "--log_file=" + tmplog.name]).then(() => {
                load_file(tmpout.name).then((sme) => { show_alert("Synthesis Completed", "info"); resolve(sme) })
            })
        });
    })

    return promise
}


async function fit_spectrum(sme: SmeFile) {
    var script_file = join(__dirname, "scripts/fit_spectrum.py")
    var tmpin = tmp.fileSync({ postfix: ".sme" });
    var tmpout = tmp.fileSync({ postfix: ".sme" });
    var tmplog = tmp.fileSync({ postfix: ".log", keep: true });

    console.log("Watching file: " + tmplog.name)
    const watcher = chokidar.watch(tmplog.name, { usePolling: true })
    watcher.on('change', update_log);

    var promise = new Promise<SmeFile>((resolve, reject) => {
        save_file(tmpin.name, sme).then(() => {
            call_python("fit_spectrum.py", [tmpin.name, tmpout.name, ...sme.header.fitparameters, "--log_file=" + tmplog.name]).then(() => {
                load_file(tmpout.name).then((sme) => { show_alert("Fit Completed", "info"); resolve(sme); })
            })
        });
    })

    return promise
}

async function get_pysme_version() {
    let tmpout = tmp.fileSync({ postfix: ".txt" });
    let success = await call_python("get_pysme_version.py", [tmpout.name])
    let data = fs.readFileSync(tmpout.name, { encoding: "utf-8" })
    return data
}

function cast_load_event(sme: SmeFile, ...updated: string[]) {
    dispatchEvent(new CustomEvent("pysme_load", { detail: { structure: sme, updated: updated } }))
}

var ButtonLoad = document.getElementById("btn-load")
ButtonLoad.addEventListener('click', async (event) => {
    var out = await dialog.showOpenDialog({ properties: ["openFile"] })
    if (!out.canceled) {
        var fname = out.filePaths[0];
        console.log("Opening new file: " + fname)
        sme = await load_file(fname)
        cast_load_event(sme)
    } else {
        console.log("User did not select a file")
    }
})

var ButtonSave = document.getElementById("btn-save")
ButtonSave.addEventListener('click', async (event) => {
    var out = await dialog.showSaveDialog({ properties: ["showOverwriteConfirmation"] })
    if (!out.canceled) {
        var fname = out.filePath
        console.log("Saving to file: " + fname)
        save_file(fname, sme)
    } else {
        console.log("User did not select a file")
    }
})

var ButtonSynthesize = document.getElementById("btn-synthesize")
ButtonSynthesize.addEventListener('click', async (event) => {
    console.log("Start synthesizing")
    try {
        sme = await synthesize_spectrum(sme)
        cast_load_event(sme, "spectrum", "citation")
    } catch (err) {
        console.error(err)
    }
})

var ButtonFit = document.getElementById("btn-fit")
ButtonFit.addEventListener('click', async (event) => {
    console.log("Start fitting")
    try {
        sme = await fit_spectrum(sme)
        cast_load_event(sme)
    } catch (err) {
        console.error(err)
    }
})

