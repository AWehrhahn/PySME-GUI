var DivAlert = document.getElementById("div-alert")

addEventListener("show_error", (event: CustomEvent) => {
    let message = event.detail.message as string
    let level = event.detail.level as LogLevel
    show_error_sync(message, level)
})


function show_error(message: string, level: LogLevel = "error") {
    dispatchEvent(new CustomEvent("show_error", { detail: { message: message, level: level } }))
}

function show_error_sync(message: string, level: LogLevel = "error") {

    let header = "Error"
    let alert_class = "alert-danger"
    switch (level) {
        case "error":
            header = "Error"
            alert_class = "alert-danger"
            break;
        case "critical":
            header = "Critical"
            alert_class = "alert-critical"
            break;
        case "debug":
            header = "Debug"
            alert_class = "alert-debug"
            break;
        case "info":
            header = "Info"
            alert_class = "alert-info"
            break;
        case "warning":
            header = "Warning"
            alert_class = "alert-warning"
            break;
        default:
            break;
    }


    let alert = document.createElement("div")
    alert.classList.add("alert", alert_class, "alert-dismissable", "fade", "show")
    alert.innerHTML = `
        <div class="d-flex flex-row align-items-center justify-content-between">
            <h4 class="alert-heading">${header}</h4>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <hr>
        <pre>${message}</pre>
        </div>
    `
    DivAlert.appendChild(alert)
}