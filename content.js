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
    let elements = document.getElementsByTagName('span')
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].title.startsWith('This Week')) {
            return elements[i].title
        }
    }
}

function getTimeClockedIn() {
    let elements = document.getElementsByTagName('div')
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].title.startsWith('Checked In at')) {
            return [elements[i].title, 'checked-in']
        }
        if (elements[i].title.startsWith('Checked Out at')) {
            return [elements[i].title, 'checked-out']
        }
    }
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
    const [text, type] = getTimeClockedIn()
    let numString
    if (type === 'checked-in') {
        numString = text.substring(14, text.length - 3)
        const numsSplit = numString.split(':')
        let timestamp = Number(numsSplit[0])
        timestamp += (Number(numsSplit[1]) / 60)
        timestamp += (Number(numsSplit[2]) / 3600)
        return timestamp
    } else {
        const d = new Date(Date.now())
        let timestamp = d.getHours() % 12
        timestamp += d.getMinutes() / 60
        timestamp += d.getSeconds() / 3600
        return timestamp
    }    
}

function sendNumToString(inputNum) {
    return inputNum.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
}

function calculateClockOutTime(clockIn, timeRemaining) {
    const clockOutTime = clockIn + timeRemaining

    const secondsRemaining = Math.round(clockOutTime * 3600)
    const hours = Math.floor(clockOutTime) % 12
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
