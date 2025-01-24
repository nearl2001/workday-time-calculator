// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "processElement") {
        const currentHours = getCurrentHours()
        const clockIn = getClockIn()
        const targetHours = message.timetarget

        if (currentHours != null) {
            const result = calculate(currentHours, targetHours, clockIn)
            sendResponse({ success: true, result })
        } else {
            sendResponse({ success: false, error: "Element not found" })
        }
    }
});
  
function getTimeWorkedSoFar() {
    let elements = document.getElementsByClassName("WMTM")
    if (elements[0] != null && elements[0].innerText != '') {
        return elements[0].innerText
    } else {
        elements = document.getElementsByClassName("WNTM")
        return elements[0] ? elements[0].innerText : null
    }
    
}

function getTimeClockedIn() {
    const elements = document.querySelectorAll('.gwt-Label', '.WEOO', '.WNMO')
    return elements[0] ? elements[0].innerText : null
}

// Gather the target number from a string
function getCurrentHours() {
    const text = getTimeWorkedSoFar()
    if (text == null || text == '') {
        return null
    }
    const numString = text.substring(11, text.length - 7)
    return Number(numString)
}

function getClockIn() {
    const text = getTimeClockedIn()
    const numString = text.substring(14, text.length - 3)
    const numsSplit = numString.split(':')
    let timestamp = Number(numsSplit[0])
    timestamp += (Number(numsSplit[1]) / 60)
    timestamp += (Number(numsSplit[2]) / 3600)
    return timestamp
}

function sendNumToString(inputNum) {
    return inputNum.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
}

function calculateClockOutTime(clockIn, timeRemaining) {
    const clockOutTime = clockIn + timeRemaining

    const secondsRemaining = Math.round(clockOutTime * 3600)
    const hours = Math.floor(clockOutTime)
    const minutes = Math.floor((secondsRemaining % 3600) / 60)
    const seconds = secondsRemaining % 60

    return `${hours}:${sendNumToString(minutes)}:${sendNumToString(seconds)}`
}

function calculateTimeRemaining(remainingTime) {
    const secondsRemaining = Math.round(remainingTime * 3600)
    const hours = Math.floor(remainingTime)
    const minutes = Math.floor((secondsRemaining % 3600) / 60)
    const seconds = secondsRemaining % 60

    return `${hours}:${sendNumToString(minutes)}:${sendNumToString(seconds)}`
}
  
// Perform calculations
function calculate(currentHours, targetHours, clockIn) {
    let remainingTime = targetHours - currentHours
    if (remainingTime < 0) {
        return ['Nothing', 'You\'re Done!']
    }
    const timeRemaining = calculateTimeRemaining(remainingTime)
    const clockOut = calculateClockOutTime(clockIn, remainingTime)
    return [timeRemaining, clockOut]
}
