// Round Names
const roundTextYellowEl = document.getElementById("roundTextYellow")
const roundTextBlackEl = document.getElementById("roundTextBlack")
const roundTextMaxWidth = 510
let roundName
let allBeatmaps

// Load in mappool
async function getMappool() {
    const response = await fetch("../_data/showcaseBeatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundName = responseJson.roundName.toUpperCase()
    roundTextYellowEl.innerText = roundName
    roundTextBlackEl.innerText = roundName
    setLetterSize(roundTextYellowEl)
    setLetterSize(roundTextBlackEl)

    // Set beatmaps
    allBeatmaps = responseJson.beatmaps
}

function setLetterSize(element) {
    let currentLetterSpacing = window.getComputedStyle(element).getPropertyValue("letter-spacing").slice(0,-2)
    let currentLetterSpacingConditionMet = false
    while (!currentLetterSpacingConditionMet) {
        if (element.getBoundingClientRect().width > roundTextMaxWidth + 1) {
            currentLetterSpacing -= 0.01
            element.style.letterSpacing = `${currentLetterSpacing}px`
        } else if (element.getBoundingClientRect().width < roundTextMaxWidth - 1) {
            currentLetterSpacing += 0.01
            element.style.letterSpacing = `${currentLetterSpacing}px`
        } else {
            currentLetterSpacingConditionMet = true
        }
    }
}

getMappool()

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Map details
const titleNameEl = document.getElementById("titleName")
const artistNameEl = document.getElementById("artistName")
const mapperNameEl = document.getElementById("mapperName")
const difficultyNameEl = document.getElementById("difficultyName")
let currentId, currentMd5
let foundMapInMappool = false
// Stats
const statsLengthEl = document.getElementById("statsLength")
const statsSREl = document.getElementById("statsSR")
const statsBPMEl = document.getElementById("statsBPM")
const statsAREl = document.getElementById("statsAR")
const statsCSEl = document.getElementById("statsCS")
const statsHPEl = document.getElementById("statsHP")
const statsODEl = document.getElementById("statsOD")

socket.onmessage = async (event) => {
    const data = JSON.parse(event.data)   
    console.log(data)

    // Map details
    if (currentId !== data.menu.bm.id || currentMd5 !== data.menu.bm.md5) {
        currentId = data.menu.bm.id
        currentMd5 = data.menu.bm.md5

        titleNameEl.innerText = data.menu.bm.metadata.title
        artistNameEl.innerText = data.menu.bm.metadata.artist
        mapperNameEl.innerText = data.menu.bm.metadata.mapper
        difficultyNameEl.innerText = data.menu.bm.metadata.difficulty
    }
    // Stats
    if (!foundMapInMappool) {
        // Length
        let lengthSeconds = Math.round(data.menu.bm.time.full / 1000)
        let lengthMinutes = Math.floor(lengthSeconds / 60)
        let remainderSeconds = lengthSeconds % 60
        statsLengthEl.innerText = `${lengthMinutes}:${("0" + remainderSeconds.toString()).slice(-2)}`
        // SR
        statsSREl.innerText = data.menu.bm.stats.fullSR
        // BPM
        statsBPMEl.innerText = data.menu.bm.stats.BPM.common
        // CS
        statsCSEl.innerText = data.menu.bm.stats.CS
        // HP
        statsHPEl.innerText = data.menu.bm.stats.HP
        // OD
        statsODEl.innerText = data.menu.bm.stats.OD
    }
}