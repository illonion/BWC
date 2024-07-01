const allFlags = [
    {name: `kotomiler`, image: `https://i.imgur.com/gukG0kE.jpeg`},
    {name: `Financial Advisors`, image: `https://i.imgur.com/Gdh80kf.jpeg`},
    {name: `Carolina Predators`, image: `https://i.imgur.com/t6vKNYr.png`},
    {name: `droidMya`, image: `https://i.imgur.com/zqX3oxh.png`},
    {name: `we are crying`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `skibidi dop dop`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `top4ik team`, image: `https://i.imgur.com/44C1U0F.png`},
    {name: `Gremlin Tamers`, image: `https://i.imgur.com/TbvEMAz.png`},
    {name: `washed walmart`, image: `https://i.imgur.com/UheEY0I.png`},
    {name: `Xi bal`, image: `https://i.imgur.com/raxf4bi.png`},
    {name: `Krutie568`, image: `https://i.imgur.com/VseGsVS.jpeg`},
    {name: `Jemzsee's team`, image: `https://i.imgur.com/E8ZwUrx.jpeg`},
    {name: `Tongnamu`, image: `https://i.imgur.com/fEB11rx.png`},
    {name: `uprankers`, image: `https://i.imgur.com/STWWb6P.png`},
    {name: `Don't osu play CS2`, image: `https://i.imgur.com/GgjxEqs.png`},
    {name: `all(most)digitteam`, image: `https://i.imgur.com/zzocUaG.png`},
    {name: `BeceJIbIe_Oryp4uku`, image: `https://i.imgur.com/MFm8wxD`},
    {name: `HERE COMES CMAN`, image: `https://i.imgur.com/oILn5NT.png`},
    {name: `二九三六`, image: `https://i.imgur.com/w81A7j2.png`},
    {name: `bebop`, image: `https://i.imgur.com/bTwmSvR.png`},
    {name: `Papus Worldwide`, image: `https://i.imgur.com/tFoszll.jpeg`},
    {name: `fearlesstalentless`, image: `https://i.imgur.com/ZNiJDUl.png`},
    {name: `pochki otkazali`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `TRAPPIN 4444`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `我的欧金金观崩溃了`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `GG pour la win`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `rhythm rebels`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `No BlueScreen`, image: `https://i.imgur.com/gyNEcK4.png`},
    {name: `#FREETOFY`, image: `https://i.imgur.com/wW5cjKq.png`},
    {name: `We DONT groom kids`, image: `https://i.imgur.com/sZ3zxTx.png`},
    {name: `BLEHHH :P"`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `KatawaShoujoLovers`, image: `https://i.imgur.com/zHBLVMH.png`},
    {name: `cai cheng en`, image: `https://i.imgur.com/gLfMMLq.png`},
    {name: `ice cream if fc`, image: `https://i.imgur.com/oIoPpgd`},
    {name: `7Digits Undercover`, image: `https://i.imgur.com/UyHrbzb.png`},
    {name: `meow`, image: `https://i.imgur.com/gLfMMLq.png`}
]

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function downloadImages() {
    for (const flag of allFlags) {
        try {
            const response = await fetch(flag.image)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = `${flag.name}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url);
            await delay(100)
        } catch (error) {
            console.error(`Failed to download image: ${flag.name}`, error)
        }
    }
}

// downloadImages()