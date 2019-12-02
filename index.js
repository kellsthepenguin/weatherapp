const Koa = require('koa')
const views = require('koa-views')
const EJS = require('ejs') // eslint-disable-line
const superfetch = require('superfetch')
const OWM_API_KEY = require('./config.json').OWM_API_KEY
const IPSTACK_API_KEY = require('./config.json').IPSTACK_API_KEY

const app = new Koa()

app.proxy = true

function getRandomColor () {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

app.use(views('views/', { autoRender: false, extension: 'ejs' }))

app.use(async function (ctx) {
  if (ctx.path === '/') {
    const locationdata = await superfetch.get(`http://api.ipstack.com/${ctx.ip.split(':').pop()}?access_key=${IPSTACK_API_KEY}&format=1`)
    const weatherdata = await superfetch.get(`http://api.openweathermap.org/data/2.5/weather?lat=${JSON.parse(locationdata).latitude}&lon=${JSON.parse(locationdata).longitude}&APPID=${OWM_API_KEY}`)
    ctx.body = await ctx.render('index', { temp: Math.floor(JSON.parse(weatherdata).main.temp - 273.15), weatherName: JSON.parse(weatherdata).weather[0].main, color: getRandomColor() })
  }
})

app.listen(3001)
