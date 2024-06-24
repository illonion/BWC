// Round Name
const roundNameEl = document.getElementById("roundName")
let roundName

// Mappool stuff
const redBanCardsContainerEl = document.getElementById("redBanCardsContainer")
const blueBanCardsContainerEl = document.getElementById("blueBanCardsContainer")
const redPickSectionEl = document.getElementById("redPickSection")
const bluePickSectionEl = document.getElementById("bluePickSection")
let currentFirstTo, currentBanNumber
let allBeatmaps

// Load in mappool
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundName = responseJson.roundName.toUpperCase()
    roundNameEl.innerText = roundName
    // Set beatmaps
    allBeatmaps = responseJson.beatmaps

    // Set ban and pick things
    switch (roundName) {
        case "ROUND OF 32": case "ROUND OF 16":
            currentFirstTo = 4
            currentBanNumber = 1
            break
        case "QUARTERFINALS": case "SEMIFINALS":
            currentFirstTo = 5
            currentBanNumber = 2
            break
        case "GRAND FINALS": case "FINALS":
            currentFirstTo = 6
            currentBanNumber = 2
            break
    }

    // Reset bans 
    redBanCardsContainerEl.innerHTML = ""
    blueBanCardsContainerEl.innerHTML = ""
    redBanCardsContainerEl.classList.remove("banCardsContainerMultipleChildren")
    redBanCardsContainerEl.classList.remove("banCardsContainerOneChild")
    blueBanCardsContainerEl.classList.remove("banCardsContainerMultipleChildren")
    blueBanCardsContainerEl.classList.remove("banCardsContainerOneChild")
    
    // Set position of ban cards
    if (currentBanNumber === 1) {
        blueBanCardsContainerEl.classList.add("banCardsContainerOneChild")
        redBanCardsContainerEl.classList.add("banCardsContainerOneChild")
    } else {
        blueBanCardsContainerEl.classList.add("banCardsContainerMultipleChildren")
        redBanCardsContainerEl.classList.add("banCardsContainerMultipleChildren")
    }

    // Append ban cards
    for (let i = 0; i < currentBanNumber; i++) {
        const banCardRed = document.createElement("div")
        banCardRed.classList.add("banCard")
        redBanCardsContainerEl.append(banCardRed)

        const banCardBlue = document.createElement("div")
        banCardBlue.classList.add("banCard")
        blueBanCardsContainerEl.append(banCardBlue)
    }

    // Create pick card
    function createPickCard(colour) {
        let pickCard = document.createElement("div")
        pickCard.classList.add("pickCard")
        
        let pickCardBackground = document.createElement("div")
        pickCardBackground.classList.add("pickCardWhole")

        let pickCardLayer = document.createElement("div")
        pickCardLayer.classList.add("pickCardWhole", "pickCardLyer")
        
        let pickCardBorder = document.createElement("div")
        pickCardBorder.classList.add("pickCardWhole", `pickCardBorder${colour}`)
        
        let pickCardText = document.createElement("div")
        pickCardText.classList.add("pickCardText")

        pickCard.append(pickCardBackground, pickCardLayer, pickCardBorder, pickCardText)
        return pickCard
    }

    // Set pick cards
    for (let i = 0; i < currentFirstTo; i++) {
        redPickSectionEl.append(createPickCard("Red"))
        bluePickSectionEl.append(createPickCard("Blue"))
    }
}

getMappool()

// Find map in mappool
const findMapInMappool = beatmapID => allBeatmaps.find(map => map.beatmapID === beatmapID)

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Team Information
const redTeamBannerEl = document.getElementById("redTeamBanner")
const redTeamNameEl = document.getElementById("redTeamName")
const redTeamStarsEl = document.getElementById("redTeamStars")
const blueTeamBannerEl = document.getElementById("blueTeamBanner")
const blueTeamNameEl = document.getElementById("blueTeamName")
const blueTeamStarsEl = document.getElementById("blueTeamStars")
let currentRedTeamName, currentBlueTeamName
let currentBestOf, currentRedTeamStarCount, currentBlueTeamStarCount

// Chat information
const chatDisplayEl = document.getElementById("chatDisplay")
const chatDisplayContainerEl = document.getElementById("chatDisplayContainer")
let chatLength = 0

socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Team information
    if (currentRedTeamName !== data.tourney.manager.teamName.left) {
        currentRedTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = currentRedTeamName
    }
    if (currentBlueTeamName !== data.tourney.manager.teamName.right) {
        currentBlueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = currentBlueTeamName
    }

    if (currentRedTeamStarCount !== data.tourney.manager.stars.left ||
        currentBlueTeamStarCount !== data.tourney.manager.stars.right ||
        currentBestOf !== data.tourney.manager.bestOF) {

        // Set all numbers
        currentBestOf = data.tourney.manager.bestOF
        let currentFirstTo = Math.ceil(currentBestOf / 2)
        currentRedTeamStarCount = data.tourney.manager.stars.left
        currentBlueTeamStarCount = data.tourney.manager.stars.right

        // Reset stars
        redTeamStarsEl.innerHTML = ""
        blueTeamStarsEl.innerHTML = ""

        // Create star
        function createStar(fill) {
            const teamStar = document.createElement("div")
            teamStar.classList.add("teamStar")
            if (fill) teamStar.classList.add("teamStarFill")
            return teamStar
        }
        
        for (let i = 0; i < currentRedTeamStarCount; i++) redTeamStarsEl.append(createStar(true))
        for (let i = 0; i < currentFirstTo; i++) redTeamStarsEl.append(createStar(false))
        for (let i = 0; i < currentBlueTeamStarCount; i++) blueTeamStarsEl.append(createStar(true))
        for (let i = 0; i < currentFirstTo; i++) blueTeamStarsEl.append(createStar(false))
    }

    // Chat Display
    if (chatLength !== data.tourney.manager.chat.length) {
        // Chat stuff
        // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
        (chatLength === 0 || chatLength > data.tourney.manager.chat.length) ? (chatDisplayContainerEl.innerHTML = "", chatLength = 0) : null;
        const fragment = document.createDocumentFragment()

        for (let i = chatLength; i < data.tourney.manager.chat.length; i++) {
            const chatColour = data.tourney.manager.chat[i].team

            // Chat message container
            const chatMessageContainer = document.createElement("div")
            chatMessageContainer.classList.add("chatMessageContainer")
        
            // Time
            const chatTime = document.createElement("div")
            chatTime.classList.add("chatTime")
            chatTime.innerText = data.tourney.manager.chat[i].time

            // Whole message
            const wholeMessage = document.createElement("div")
            wholeMessage.classList.add("wholeMessage")

            // Name
            const messageUser = document.createElement("div")
            messageUser.classList.add("messageUser", chatColour)
            messageUser.innerText = `${data.tourney.manager.chat[i].name}: `

            // Message
            const messageContent = document.createElement("div")
            messageContent.classList.add("messageContent")
            messageContent.innerText = data.tourney.manager.chat[i].messageBody

            wholeMessage.append(messageUser, messageContent)
            chatMessageContainer.append(chatTime, wholeMessage)
            fragment.append(chatMessageContainer)
        }

        chatDisplayContainerEl.append(fragment)
        chatLength = data.tourney.manager.chat.length
        chatDisplayContainerEl.scrollTo({
            top: chatDisplayContainerEl.scrollHeight,
            behavior: 'smooth'
        })
        chatDisplayEl.scrollTo({
            top: chatDisplayContainerEl.scrollHeight,
            behavior: 'smooth'
        })
    }
    console.log(data)
}