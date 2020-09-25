// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange icon-glyph: quote-right

const User = 'USER'
const City = 'beijing'
const WeatherKey = '' // you can get it from https://dev.heweather.com/
const AQIToken = '' // you can get it from https://aqicn.org/data-platform/token/#/

const aqi = await getAQI()
const lunarData = await getLunarData()
const weatherData = await getWeather()

const widget = createWidget()
Script.setWidget(widget)
Script.complete()

function createWidget() {
    const w = new ListWidget()
    const bgColor = new LinearGradient()

    bgColor.colors = [new Color('#2c5364'), new Color('#203a43'), new Color('#0f2027')]
    bgColor.locations = [0.0, 0.5, 1.0]
    w.backgroundGradient = bgColor

    w.setPadding(12, 12, 12, 6)
    w.spacing = 6

    const time = new Date()

    const hour = time.getHours()
    const isMidnight = hour < 8 && 'midnight'
    const isMorning = hour >= 8 && hour < 12 && 'morning'
    const isAfternoon = hour >= 12 && hour < 19 && 'afternoon'
    const isEvening = hour >= 19 && hour < 21 && 'evening'
    const isNight = hour >= 21 && 'night'

    const dfTime = new DateFormatter()
    dfTime.locale = 'en'
    dfTime.useMediumDateStyle()
    dfTime.useNoTimeStyle()

    const Line1 = w.addText(`[🤖]Hi, ${User}. Good ${isMidnight || isMorning || isAfternoon || isEvening || isNight}`)
    Line1.textColor = new Color('#ffffff')
    Line1.font = new Font('Menlo', 11)

    const enTime = dfTime.string(time)
    const Line2 = w.addText(`[📅]${enTime} ${lunarData}`)
    Line2.textColor = new Color('#C6FFDD')
    Line2.font = new Font('Menlo', 11)

    const Line3 = w.addText(`[☁️]${weatherData} AQI:${aqi}`)
    Line3.textColor = new Color('#FBD786')
    Line3.font = new Font('Menlo', 11)

    const Line4 = w.addText(`[${Device.isCharging() ? '⚡️' : '🔋'}]${renderBattery()} Battery`)
    Line4.textColor = new Color('#2aa876')
    Line4.font = new Font('Menlo', 11)

    const Line5 = w.addText(`[🕒]${renderYearProgress()} YearProgress`)
    Line5.textColor = new Color('#f19c65')
    Line5.font = new Font('Menlo', 11)

    return w
}

async function getAQI() {
    const url = `https://api.waqi.info/feed/beijing/?token=${AQIToken}`
    const request = new Request(url)
    const res = await request.loadJSON()
    return res.data.aqi
}

async function getLunarData() {
    const url = 'https://api.xlongwei.com/service/datetime/convert.json'
    const request = new Request(url)
    const res = await request.loadJSON()
    return `${res.ganzhi}年（${res.shengxiao}）${res.chinese.replace(/.*年/, '')}`
}

async function getWeather() {
    const requestCityInfo = new Request(
        `https://geoapi.heweather.net/v2/city/lookup?key=${WeatherKey}&location=${City}&lang=en`
    )
    const resCityInfo = await requestCityInfo.loadJSON()
    const { name, id } = resCityInfo.location[0]

    const requestNow = new Request(`https://devapi.heweather.net/v7/weather/now?location=${id}&key=${WeatherKey}&lang=en`)
    const requestDaily = new Request(`https://devapi.heweather.net/v7/weather/3d?location=${id}&key=${WeatherKey}&lang=en`)
    const resNow = await requestNow.loadJSON()
    const resDaily = await requestDaily.loadJSON()

    return `${name} ${resNow.now.text} T:${resNow.now.temp}° H:${resDaily.daily[0].tempMax}° L:${resDaily.daily[0].tempMin}°`
}

function renderProgress(progress) {
    const used = '▓'.repeat(Math.floor(progress * 24))
    const left = '░'.repeat(24 - used.length)
    return `${used}${left} ${Math.floor(progress * 100)}%`
}

function renderBattery() {
    const batteryLevel = Device.batteryLevel()
    return renderProgress(batteryLevel)
}

function renderYearProgress() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1) // Start of this year
    const end = new Date(now.getFullYear() + 1, 0, 1) // End of this year
    const progress = (now - start) / (end - start)
    return renderProgress(progress)
}
