// Handle the plotly plotting canvas
// Including events, buttons, etc.

// The currently selected segment
var segment = 0;
var nSegment = 1;
var wave_range = null;
// The mask mode, that is applied to the selected points
var mask_mode = "good";

// The traces to plot in the window
var trace1 = {
    x: [1, 2],
    y: [1, 1],
    line: { color: "#1f77b4" },
    mode: "lines+markers",
    type: 'scattergl',
    name: 'Observation',
    marker: { opacity: 0 }
};

var trace2 = {
    x: [1, 2],
    y: [1, 1],
    line: { color: "#ff7f0e" },
    mode: "lines+markers",
    type: 'scattergl',
    name: 'Synthetic',
    marker: { opacity: 0 }
};

var trace3 = {
    x: [],
    y: [],
    fill: "tozeroy",
    fillcolor: "#d62728",
    mode: "none",
    name: "Cont Mask",
    hoverinfo: "none"
}

var trace4 = {
    x: [],
    y: [],
    fill: "tozeroy",
    fillcolor: "#bcbd22",
    mode: "none",
    name: "Line Mask",
    hoverinfo: "none"
}

var data = [trace3, trace4, trace1, trace2];
var layout = {
    xaxis: { title: "Wavelength [Å]" },
    yaxis: { title: "Intensity" },
    showlegend: true,
    legend: { traceorder: "reversed" },
    font: { family: "Open Sans, sans-serif" },
    dragmode: "select",
    selectdirection: "h",
    uirevision: true,
    datarevision: 0
}

graphDiv = document.getElementById('graphDiv');
Plotly.react(graphDiv, data, layout, { responsive: true });

// Define Functions here
const update_annotations = (segment, wmin, wmax) => {
    if ((wave_range == null) || (wave_range[0] != wmin) || (wave_range[1] != wmax)) {
        wave_range = [wmin, wmax]
        console.log("Get annotations for:")
        console.log("Wmin: " + wmin + ", Wmax: " + wmax)
        get_annotations(segment, wmin, wmax).then((res) => {
            layout.annotations = res
            layout.datarevision = layout.datarevision + 1
            Plotly.react(graphDiv, data, layout)
        })
    }
}

const plot = (segment) => {
    layout.title = "Segment " + segment
    get_spectrum(segment).then((res) => {
        trace1.x = res[0]
        trace1.y = res[1]
        return get_synthetic(segment)
    }).then((res) => {
        trace2.x = res[0]
        trace2.y = res[1]
        return get_cont_mask(segment)
    }).then((res) => {
        trace3.x = res[0]
        trace3.y = res[1]
        return get_line_mask(segment)
    }).then((res) => {
        trace4.x = res[0]
        trace4.y = res[1]
        var wmin = res[0][0]
        var wmax = res[0][res[0].length - 1]
        layout.xaxis.autorange = true
        return get_annotations(segment, wmin, wmax)
    }).then((res) => {
        layout.annotations = res
        layout.datarevision = layout.datarevision + 1
        Plotly.react(graphDiv, data, layout)
    })

}

// Define Plotly graph events
graphDiv.on('plotly_selected', (event) => {
    console.log("Selected points" + event.points.length)
    x = []
    event.points.forEach((pt) => {
        var i = pt.pointNumber
        var trace = pt.curveNumber
        if (trace == 3) {
            x.push(i)
        }
    })
    console.log(x)
    set_mask(segment, x, mask_mode).then(() => { plot(segment) });
})

//TODO resize without event
graphDiv.on('plotly_relayout', (event) => {
    console.log(event)
    if (event["xaxis.autorange"]) {
        // i.e. the whole range of the segment
        var wmin = null;
        var wmax = null;
        update_annotations(segment, wmin, wmax)
    } else {
        if (event["xaxis.range[0]"]) {
            var wmin = event["xaxis.range[0]"]
            var wmax = event["xaxis.range[1]"]
            update_annotations(segment, wmin, wmax)
        }
    }
})

// const ButtonMaskGood = document.getElementById('button-mask-good')
// ButtonMaskGood.addEventListener('click', (event) => {
//     console.log("Changing mask mode to good")
//     mask_mode = "good"
// })

// const ButtonMaskBad = document.getElementById('button-mask-bad')
// ButtonMaskBad.addEventListener('click', (event) => {
//     console.log("Changing mask mode to bad")
//     mask_mode = "bad"
// })

// const ButtonMaskCont = document.getElementById('button-mask-cont')
// ButtonMaskCont.addEventListener('click', (event) => {
//     console.log("Changing mask mode to cont")
//     mask_mode = "cont"
// })

// const ButtonMaskLine = document.getElementById('button-mask-line')
// ButtonMaskLine.addEventListener('click', (event) => {
//     console.log("Changing mask mode to line")
//     mask_mode = "line"
// })

const ButtonSegmentPrev = document.getElementById('button-previous-segment')
ButtonSegmentPrev.addEventListener('click', (event) => {
    console.log("Going to previous segment")
    if (segment > 0) {
        segment = segment - 1
        plot(segment)
    }
})

const ButtonSegmentNext = document.getElementById('button-next-segment')
ButtonSegmentNext.addEventListener('click', (event) => {
    console.log("Going to next segment")
    if (segment < nSegment - 1) {
        segment = segment + 1
        plot(segment)
    }
})

