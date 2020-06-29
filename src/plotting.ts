
// Define the colors and linestyles to use in the plot
var fmt = {
    Obs: { color: "#1f77b4", linestyle: "solid" },
    Syn: { color: "#ff7f0e", linestyle: "solid", marker: "" },
    LineMask: { facecolor: "#bcbd22", alpha: 1 },
    ContMask: { facecolor: "#d62728", alpha: 1 },
}

type mask_modes = "bad" | "line" | "cont";
var mask_mode: mask_modes = "cont"
var initial_setup = true
var graphDiv: any = document.getElementById('div-graph') as HTMLDivElement;
var data: any = []
var layout: any = {}
var data_index: { [id: string]: { [id: number]: number } } = {
    linemask: {},
    contmask: {},
    spec: {},
    synth: {}
}
// Not showing annotations is a lot faster
var show_annotations = true;

addEventListener("pysme_load", (event: any) => {
    let sme: SmeFile = event.detail.structure
    let updated: string[] = event.detail.updated
    if (!updated.length || updated.includes("spectrum") || updated.includes("linelist")) {
        plot_sme(sme)
    }
})

function reset_plot() {
    initial_setup = true
    data = []
    layout = {}
    data_index = {
        linemask: {},
        contmask: {},
        spec: {},
        synth: {}
    }
}

function get_mask_value() {
    if (mask_mode == "bad") return 0
    if (mask_mode == "line") return 1
    if (mask_mode == "cont") return 2
}

function get_segment() {
    var seg: number = layout.sliders[0].active
    return seg
}

function get_data_index(seg: number, type: "linemask" | "contmask" | "spec" | "synth") {
    return data_index[type][seg]
}

function set_mask(sme: SmeFile, range: [number, number]) {
    var value = get_mask_value()
    var seg = get_segment()

    var wave = sme.wave[seg]
    var wmin = range[0]
    var wmax = range[1]

    if (typeof (sme.mask[seg][0]) === "bigint") {
        let mask = sme.mask[seg] as BigInt64Array
        let big_value = BigInt(value)
        sme.mask[seg] = mask.map((v, i) => {
            if ((wave[i] >= wmin) && (wave[i] <= wmax)) {
                return big_value
            } else {
                return v
            }
        })
    } else {
        let mask2 = sme.mask[seg] as Int8Array
        sme.mask[seg] = mask2.map((v, i) => {
            if ((wave[i] >= wmin) && (wave[i] <= wmax)) {
                return value
            } else {
                return v
            }
        })
    }

    var idx = get_data_index(seg, "linemask")
    var [x, y] = create_mask_points(
        sme.wave[seg], sme.spec[seg], sme.mask[seg], 1
    )
    data[idx].x = x
    data[idx].y = y

    var idx = get_data_index(seg, "contmask")
    var [x, y] = create_mask_points(
        sme.wave[seg], sme.spec[seg], sme.mask[seg], 2
    )

    data[idx].x = x
    data[idx].y = y

    layout.datarevision = layout.datarevision + 1
    Plotly.react(graphDiv, data, layout)
}

function create_mask_points(x: FloatArray, y: FloatArray, mask: IntArray, value: number) {
    // Creates the points that define the outer edge of the mask region
    y = y.map((v: number, i: number) => {
        if (mask[i] == value) {
            return v
        } else {
            return 0
        }
    })

    x = x.map((v: number, i: number, a: FloatArray) => {
        if ((i == 0) || (i == a.length - 1)) {
            return v
        } else {
            if ((mask[i] != value) && (mask[i + 1] == value)) {
                return a[i + 1]
            } else {
                if ((mask[i] != value) && (mask[i - 1] == value)) {
                    return a[i - 1]
                } else {
                    return v
                }
            }
        }
    })

    return [x, y]
}

function plot_sme(sme: any) {
    reset_plot()
    var nSegment = sme.wave.length

    // Create Plot
    var annotations: any = {};
    var visible: any = [];
    var line_mask_idx: { [id: number]: any } = {};
    var cont_mask_idx: { [id: number]: any } = {};
    var steps = []
    var counter = 0;


    for (let seg = 0; seg < nSegment; seg++) {
        var k = visible.length
        line_mask_idx[seg] = k
        cont_mask_idx[seg] = k + 1
        // The order of the plots is chosen by the z order, from low to high
        // Masks should be below the spectra (so they don't hide half of the line)
        // Synthetic on top of observation, because synthetic varies less than observation
        // Annoying I know, but plotly doesn't seem to have good controls for the z order
        // Or Legend order for that matter

        if (sme.mask) {
            // Line mask
            var [x, y] = create_mask_points(
                sme.wave[seg], sme.spec[seg], sme.mask[seg], 1
            )

            data.push({
                type: "scattergl",
                x: x,
                y: y,
                fillcolor: fmt["LineMask"]["facecolor"],
                fill: "tozeroy",
                mode: "none",
                name: "Line Mask",
                hoverinfo: "none",
                legendgroup: 2,
                visible: 0 == seg,
            })
            visible.push(seg)
            data_index["linemask"][seg] = counter
            counter += 1

            // Cont mask
            var [x, y] = create_mask_points(
                sme.wave[seg], sme.spec[seg], sme.mask[seg], 2
            )

            data.push(
                {
                    type: "scattergl",
                    x: x,
                    y: y,
                    fillcolor: fmt["ContMask"]["facecolor"],
                    fill: "tozeroy",
                    mode: "none",
                    name: "Continuum Mask",
                    hoverinfo: "none",
                    legendgroup: 2,
                    visible: 0 == seg,
                }
            )
            visible.push(seg)
            data_index["contmask"][seg] = counter
            counter += 1
        }

        if (sme.spec) {
            //Observation
            data.push({
                type: "scattergl",
                x: sme.wave[seg],
                y: sme.spec[seg],
                line: { "color": fmt["Obs"]["color"] },
                name: "Observation",
                legendgroup: 0,
                visible: 0 == seg,
            })
            visible.push(seg)
            data_index["spec"][seg] = counter
            counter += 1
        }
        if (sme.synth) {
            // Synthetic
            data.push({
                type: "scattergl",
                x: sme.wave[seg],
                y: sme.synth[seg],
                name: "Synthethic",
                line: { "color": fmt["Syn"]["color"] },
                legendgroup: 1,
                visible: 0 == seg,
            })
            visible.push(seg)
            data_index["synth"][seg] = counter
            counter += 1
        }
        if (show_annotations && sme.linelist.data) {
            var lines = sme.linelist.data
            var wmin: number = sme.wave[seg][0]
            var wmax: number = sme.wave[seg][sme.wave[seg].length - 1]
            var vrad = 0
            if (sme.header.vrad) vrad = sme.header.vrad[seg]
            wmin *= 1 - vrad / 3e5
            wmax *= 1 - vrad / 3e5

            var seg_annotations: any = []

            for (let key = 0; key < lines.length; key++) {
                const element: number = lines[key]["wlcent"];
                if ((element > wmin) && (element < wmax)) {

                    var x_loc = element * (1 + vrad / 3e5)
                    var y_loc = 1

                    // Find the clostest data point
                    var i = 0;
                    var idx = -1;
                    var closest = sme.wave[seg].reduce((acc: number, value: number) => {
                        i += 1;
                        if (Math.abs(value - x_loc) < acc) {
                            idx = i;
                            return Math.abs(value - x_loc)
                        } else {
                            return acc
                        }
                    }, wmax)

                    if (idx != -1) {
                        x_loc = sme.wave[seg][idx]

                        if (sme.synth) {
                            y_loc = sme.synth[seg][idx]
                        } else {
                            if (sme.spec) {
                                y_loc = sme.spec[seg][idx]
                            }
                        }
                    }

                    seg_annotations.push({
                        x: x_loc,
                        y: y_loc,
                        xref: "x",
                        yref: "y",
                        text: lines[key]["species"],
                        hovertext: lines[key]["wlcent"],
                        textangle: 90,
                        opacity: 1,
                        ax: 0,
                        ay: 1.2,
                        ayref: "y",
                        showarrow: true,
                        arrowhead: 7,
                        xanchor: "left"
                    })
                }
            }
            annotations[seg] = seg_annotations
        }


    }
    for (let seg = 0; seg < nSegment; seg++) {
        // Slider Steps
        var visibility = Array.apply(null, Array(visible.length)).map(function (x: any, i: number) { return visible[i] == seg })
        var wmin: number = sme.wave[seg][0]
        var wmax: number = sme.wave[seg][sme.wave[seg].length - 1]
        var step = {
            label: `Segment ${seg}`,
            method: "update",
            args: [
                { visible: visibility },
                {
                    annotations: annotations[seg],
                    xaxis: { range: [wmin, wmax], title: "Wavelength [Å]" },
                    yaxis: { autorange: true, title: "Intensity" },
                },
            ],
        }
        steps.push(step)
    }

    var slider = {
        pad: {
            t: 30
        },
        active: 0,
        steps: steps,
    }

    layout = {
        xaxis: { title: "Wavelength [Å]" },
        yaxis: { title: "Intensity" },
        showlegend: true,
        legend: { traceorder: "reversed" },
        font: { family: "Open Sans, sans-serif" },
        selectdirection: "h",
        sliders: [slider],
        annotations: annotations[0]
    }

    var buttons = [["toImage", "zoom2d", "pan2d", "select2d", "zoomIn2d", "zoomOut2d", "autoScale2d", "resetScale2d"]];
    Plotly.react(graphDiv, data, layout, { responsive: true, displayModeBar: true, modeBarButtons: buttons });

    if (initial_setup) {
        graphDiv.on('plotly_selected', (event: any) => {
            if (event) {
                var range: [number, number] = event.range.x
                set_mask(sme, range)
            }
        })
        initial_setup = false
    }
}

var ButtonMaskLine = document.getElementById("btn-mask-line")
ButtonMaskLine.addEventListener('click', () => {
    mask_mode = "line"
})


var ButtonMaskCont = document.getElementById("btn-mask-cont")
ButtonMaskCont.addEventListener('click', () => {
    mask_mode = "cont"
})


var ButtonMaskBad = document.getElementById("btn-mask-bad")
ButtonMaskBad.addEventListener('click', () => {
    mask_mode = "bad"
})