// Round Name
const roundNameEl = document.getElementById("roundName")
let roundName

// Mappool stuff
const mappoolSelectionEl = document.getElementById("mappoolSelection")
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
    for (let i = 0; i < currentBanNumber * 2; i++) {
        const banCard = document.createElement("div")
        banCard.classList.add("banCard")

        const banCardBackground = document.createElement("div")
        banCardBackground.classList.add("banCardWhole")

        const banCardLayer = document.createElement("div")
        banCardLayer.classList.add("banCardWhole", "banCardLayer")

        const banCardBorder = document.createElement("div")
        banCardBorder.classList.add("banCardWhole", "banCardBorder")

        const banCardText = document.createElement("div")
        banCardText.classList.add("banCardText")

        banCard.append(banCardBackground, banCardLayer, banCardBorder, banCardText)
        if (i % 2 === 0) {
            redBanCardsContainerEl.append(banCard);
        } else {
            blueBanCardsContainerEl.append(banCard);
        }
    }

    // Create pick card
    function createPickCard(colour) {
        let pickCard = document.createElement("div")
        pickCard.classList.add("pickCard")
        
        let pickCardBackground = document.createElement("div")
        pickCardBackground.classList.add("pickCardWhole")

        let pickCardLayer = document.createElement("div")
        pickCardLayer.classList.add("pickCardWhole", "pickCardLayer")
        
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

    // Create mappool stuff
    for (let i = 0; i < allBeatmaps.length; i++) {
        const currentMap = allBeatmaps[i]

        // Create button
        const currentButton = document.createElement("button")
        currentButton.classList.add("sideBarButton")
        currentButton.dataset.id = currentMap.beatmapID
        currentButton.innerText = `${currentMap.mod}${currentMap.order}`
        currentButton.addEventListener("click", mapClickEvent)
        mappoolSelectionEl.append(currentButton)
    }
}

getMappool()

// Find map in mappool
const findMapInMappool = beatmapID => allBeatmaps.find(map => map.beatmapID == beatmapID)

// Load in teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/teams.json")
    allTeams = await response.json()
}

getTeams()

// Find team by team name
const findTeamByTeamName = teamName => allTeams.find(team => team.team_name === teamName)

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

// Map information
let currentId, currentMd5, foundMapInMappool

socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Team information
    if (currentRedTeamName !== data.tourney.manager.teamName.left) {
        currentRedTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = currentRedTeamName
        const currentTeam = findTeamByTeamName(currentRedTeamName)
        if (currentTeam) {
            redTeamBannerEl.style.backgroundImage = `url("${currentTeam.team_banner}")`
        }
    }
    if (currentBlueTeamName !== data.tourney.manager.teamName.right) {
        currentBlueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = currentBlueTeamName
        const currentTeam = findTeamByTeamName(currentBlueTeamName)
        if (currentTeam) {
            blueTeamBannerEl.style.backgroundImage = `url("${currentTeam.team_banner}")`
        }
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

        // Create stars
        let i = 0
        for (i; i < currentRedTeamStarCount; i++) redTeamStarsEl.append(createStar(true))
        for (i; i < currentFirstTo; i++) redTeamStarsEl.append(createStar(false))
        i = 0
        for (i; i < currentBlueTeamStarCount; i++) blueTeamStarsEl.append(createStar(true))
        for (i; i < currentFirstTo; i++) blueTeamStarsEl.append(createStar(false))
    
        // Set cookie information
        // Set winning side information and winner team name information
        if (currentRedTeamStarCount >= currentFirstTo) {
            document.cookie = "winningTeamColour=red; path=/"
            document.cookie = `winningTeamName=${currentRedTeamName}; path=/`
            document.cookie = `teamStarCount=${currentBlueTeamStarCount}; path=/`
            document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
        } else if (currentBlueTeamStarCount >= currentFirstTo) {
            document.cookie = "winningTeamColour=blue; path=/"
            document.cookie = `winningTeamName=${currentBlueTeamName}; path=/`
            document.cookie = `teamStarCount=${currentRedTeamStarCount}; path=/`
            document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
        } else {
            document.cookie = "winningTeamColour=none; path=/"
            document.cookie = `winningTeamName=noe; path=/`
            document.cookie = `teamStarCount=0; path=/`
            document.cookie = `currentFirstTo=0; path=/`
        }
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

    // Put in correct stats for mappool map
    if ((currentId !== data.menu.bm.id || currentMd5 !== data.menu.bm.md5) && allBeatmaps) {
        currentId = data.menu.bm.id
        currentMd5 = data.menu.bm.md5
        foundMapInMappool = false

        // See if the map exists inside the mappool
        const mappoolButton = document.querySelectorAll("[data-id]")
        let currentButton
        mappoolButton.forEach(button => {
            if (button.dataset.id == currentId && !button.dataset.action) {
                currentButton = button
                return
            }
        })
        
        if (currentButton) currentButton.click()
    }
}

// Next Action
const nextActionEl = document.getElementById("nextAction")
let nextActionTeam, nextActionAction
function setNextAction(team, action) {
    nextActionTeam = team
    nextActionAction = action
    nextActionEl.innerText = `${capitalizeFirstLetter(team)} ${capitalizeFirstLetter(action)}`
}

// Capitalise
function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1)
}

// Map Click Event
function mapClickEvent() {
    if (!nextActionTeam || !nextActionAction) return

    // Get current map
    const currentMapId = this.dataset.id
    const currentMap = findMapInMappool(currentMapId)
    if (!currentMap) return

    // Check if map has been banned or picked before
    const allIdElements = document.querySelectorAll("[data-id")
    let mapFound = false
    allIdElements.forEach(element => {
        if (element.dataset.id == currentMapId && (element.dataset.action === "ban" || element.dataset.action === "pick")) {
            mapFound = true
            return
        }   
    })
    if (mapFound) return

    // Set bans
    if (nextActionAction === "ban") {
        // Get current container
        const currentContainer = (nextActionTeam === "red")? redBanCardsContainerEl : blueBanCardsContainerEl
        
        // Get current tile
        let currentTile
        for (let i = 0; i < currentContainer.childElementCount; i++) {
            // If not the final container
            if (i !== currentContainer.childElementCount - 1 && currentContainer.children[i].dataset.id) continue
            currentTile = currentContainer.children[i]
            break
        }

        // Set details for the current tile
        currentTile.dataset.id = currentMapId
        currentTile.dataset.action = nextActionAction
        currentTile.children[0].style.backgroundImage = `url("${currentMap.imgURL}")`
        currentTile.children[1].style.display = "block"
        currentTile.children[3].innerText = `${currentMap.mod}${currentMap.order}`
    }

    // Set picks
    if (nextActionAction === "pick") {
        // Get current container
        const currentContainer = (nextActionTeam === "red")? redPickSectionEl : bluePickSectionEl

        // Get current tile
        let currentTile
        for (let i = 0; i < currentContainer.childElementCount; i++) {
            // If not the final container
            if (currentContainer.children[i].dataset.id) continue
            currentTile = currentContainer.children[i]
            break
        }
        if (!currentTile) return

        // Set details for the current tile
        currentTile.dataset.id = currentMapId
        currentTile.dataset.action = nextActionAction
        currentTile.children[0].style.backgroundImage = `url("${currentMap.imgURL}")`
        currentTile.children[1].style.display = "block"
        currentTile.children[3].innerText = `${currentMap.mod}${currentMap.order}`
    }

    // Set next action
    if (nextActionTeam === "red") nextActionTeam = "blue"
    else if (nextActionTeam === "blue") nextActionTeam = "red"
    setNextAction(nextActionTeam, nextActionAction)
}