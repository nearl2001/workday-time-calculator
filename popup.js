document.getElementById("process").addEventListener("click", async () => {
    runProcess()
})

document.getElementById("timetarget").addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        runProcess()
    }
})

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('timetarget').focus()
})

const runProcess = () => {
    let timetarget = document.getElementById("timetarget").value

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "processElement", timetarget }, function(response) {
            if (response != null && response.success) {
                document.getElementById("result").innerText = `Time Target: ${response.result[0]}\nClock Out At ${response.result[1]}`
            } else if (response != null) {
                document.getElementById("result").innerText = `Error: ${response.error}`
            } else {
                document.getElementById("result").innerText = `Trouble Connecting With Back-End... Maybe Reload?`
            }
        })
    })
}
