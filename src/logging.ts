
// The currently selected logging level
let log_levels = {
    "debug": 10,
    "info": 20,
    "warning": 30,
    "error": 40,
    "critical": 50,
}


var log_level = log_levels.info
var log_parsed: LogEntry[]
var groups: any = [];

var DivLog = document.getElementById('div-log');
var TabelBodyLog = document.getElementById('table-log-body');

var BtnLogLevelDebug = document.getElementById("btn-log-level-debug") as HTMLButtonElement
var BtnLogLevelInfo = document.getElementById("btn-log-level-info") as HTMLButtonElement
var BtnLogLevelWarning = document.getElementById("btn-log-level-warning") as HTMLButtonElement
var BtnLogLevelError = document.getElementById("btn-log-level-error") as HTMLButtonElement

BtnLogLevelDebug.addEventListener("click", () => { log_level = log_levels["debug"]; refresh_log(log_parsed, log_level) })
BtnLogLevelInfo.addEventListener("click", () => { log_level = log_levels["info"]; refresh_log(log_parsed, log_level) })
BtnLogLevelWarning.addEventListener("click", () => { log_level = log_levels["warning"]; refresh_log(log_parsed, log_level) })
BtnLogLevelError.addEventListener("click", () => { log_level = log_levels["error"]; refresh_log(log_parsed, log_level) })

function create_node(row: LogEntry) {
    // Colors are defined in the SCSS
    let background = `log-${row.level}`

    let html = `
        <td>${row.datetime}</td>
        <td>${row.level.toUpperCase()}</td>
        <td>${row.source}</td>
        <td class="text-nowrap">${row.message}</td>
    `

    let child = document.createElement("tr")
    child.classList.add(background)
    child.innerHTML = html
    return child
}

function parse_log(log: string) {
    let re = /^(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d,\d+)\s*-\s*(INFO|DEBUG|WARNING|ERROR|CRITICAL)\s*-\s*(\S*)\s*-\s*(.*)$/gm

    let groups: LogEntry[] = [];
    let match;
    while ((match = re.exec(log)) !== null) {
        let row: LogEntry = {
            datetime: `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`,
            level: match[7].toLowerCase() as LogLevel,
            source: match[8],
            message: match[9]
        }
        groups.push(row)
    }
    return groups;
}

function refresh_log(log_parsed: LogEntry[], log_level: number) {
    // Remove all existing entries
    TabelBodyLog.textContent = ""

    // Set new entries
    if (log_parsed) {
        log_parsed.forEach(async (row) => {
            if (row) {
                if (log_levels[row.level] >= log_level) {
                    TabelBodyLog.appendChild(create_node(row))
                }
            }
        })
    }

}

async function update_log(path: string, stats: any) {
    let log: string = fs.readFileSync(path, { encoding: "utf-8" })
    log_parsed = parse_log(log)
    refresh_log(log_parsed, log_level)
}
