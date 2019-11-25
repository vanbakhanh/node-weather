const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const apiKey = '8d2de98e089f1c28e1a22fc19a24ef04'
const request = require('request')
const initState = {
  main: {
    temp: null,
    pressure: null,
    humidity: null,
    temp_min: null,
    temp_max: null
  },
  weather: {
    id: null,
    main: null,
    description: null,
    icon: null
  },
  wind: {
    speed: null,
    deg: null
  },
  coord: {
    lat: null,
    lon: null
  },
  id: null,
  date: null,
  name: null,
  country: null,
  sunrise: null,
  sunset: null,
  visibility: null,
  clouds: null,
  error: null,
  background: null
};
var state = initState;

app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  state = initState;
  var hours = new Date().getHours();
  if (hours >= 6 && hours < 18) {
    state.background = 'default-day'
  } else {
    state.background = 'default-night'
  }
  res.render('index', { state: state })
})

app.post('/', (req, res) => {
  state = initState;
  var city = req.body.city;
  var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  request(url, function (error, response, body) {
    let data = JSON.parse(body);
    if (response.statusCode == 200) {
      state = {
        main: data.main,
        weather: data.weather[0],
        wind: data.wind,
        coord: data.coord,
        id: data.id,
        date: data.dt,
        name: data.name,
        country: data.sys.country,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        visibility: data.visibility,
        clouds: data.clouds.all,
        error: null,
        background: getBackground(data.dt),
      };
    } else if (response.statusCode == 404) {
      state.error = data.message
    }
    res.render('index', { state: state })
  });
})

function getBackground(date) {
  var hours = new Date(date * 1000).getHours();
  if (hours >= 6 && hours < 12) {
    return 'day';
  } else if (hours >= 12 && hours < 18) {
    return 'noon';
  } else if (hours >= 18 && hours < 24) {
    return 'night';
  } else {
    return 'evening';
  }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))