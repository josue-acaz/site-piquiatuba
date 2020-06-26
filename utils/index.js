import axios from 'axios';

const ip_api = axios.create({
  baseURL: 'https://ip-api.com',
});

/*const geocode_api = axios.create({
  baseURL: process.env.API_URL,
});*/

const utils = {
  queryString(parameter) {  
    let loc = location.search.substring(1, location.search.length);   
    let param_value = false;   
    let params = loc.split("&");   
    for (let i=0; i<params.length;i++) {   
        let param_name = params[i].substring(0,params[i].indexOf('='));   
        if (param_name == parameter) {                                          
            param_value = params[i].substring(params[i].indexOf('=')+1)   
        }   
    }   
    if (param_value) {   
        return param_value;
    }   
    else {   
        return undefined;
    }
  },

  flightIDGenerator(size) {
    var randomized = Math.ceil(Math.random() * Math.pow(10,size));//Cria um número aleatório do tamanho definido em size.
    var digito = Math.ceil(Math.log(randomized));//Cria o dígito verificador inicial
    while(digito > 10){//Pega o digito inicial e vai refinando até ele ficar menor que dez
        digito = Math.ceil(Math.log(digito));
    }
    var id = randomized + '-' + digito;//Cria a ID
    return id;
  },

  buildQueryString(object) {
    var esc = encodeURIComponent;
    var query = Object.keys(object)
        .map(k => esc(k) + '=' + esc(object[k]))
        .join('&');
    return query;
  },

  parseQueryString() {

    // Use location.search to access query string instead
    const qs = window.location.search.replace('?', '');

    const items = qs.split('&');

    // Consider using reduce to create the data mapping
    return items.reduce((data, item) => {

      const [key, value] = item.split('=');

      // Sometimes a query string can have multiple values 
      // for the same key, so to factor that case in, you
      // could collect an array of values for the same key
      if(data[key] !== undefined) {

        // If the value for this key was not previously an
        // array, update it
        if(!Array.isArray(data[key])) {
          data[key] = [ data[key] ]
        }       

        data[key].push(decodeURIComponent(value))
      }
      else {

        data[key] = decodeURIComponent(value)
      }

      return data

    }, {})
  },

  getRadioVal(name) {
    var value;
    var radios = document.getElementsByName(name);

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        // do whatever you want with the checked radio
        value = radios[i].value;
    
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }

    return value;
  },

  getCurrentTime() {
    const currentDateTime = new Date();
    return(`${
      currentDateTime.getHours().toString().length === 1 ? "0"+currentDateTime.getHours().toString() : currentDateTime.getHours().toString()
    }:${
      currentDateTime.getMinutes().toString().length === 1 ? "0"+currentDateTime.getMinutes().toString() : currentDateTime.getMinutes().toString()
    }:${
      currentDateTime.getSeconds().toString().length === 1 ? "0"+currentDateTime.getSeconds().toString() : currentDateTime.getSeconds().toString()
    }`);
  },

  addHoursToTime(time, hours) {
    const cuurent_date = (new Date()).toISOString().split("T")[0];
    const date = new Date(`${cuurent_date} ${time}`);
    date.setHours(date.getHours() + hours);
    
    return (`${
      date.getHours().toString().length === 1 ? "0"+date.getHours().toString() : date.getHours().toString()
    }:${
      date.getMinutes().toString().length === 1 ? "0"+date.getMinutes().toString() : date.getMinutes().toString()
    }:${
      date.getSeconds().toString().length === 1 ? "0"+date.getSeconds().toString() : date.getSeconds().toString()
    }`);
  },

  titleize(text) {
    var words = text.toLowerCase().split(" ");
    for (var a = 0; a < words.length; a++) {
        var w = words[a];
        words[a] = w[0].toUpperCase() + w.slice(1);
    }
    return words.join(" ");
  },

  lowerVal(a,b) {
    if (a.price < b.price)
      return -1;
    if (a.price > b.price)
      return 1;
    return 0;
  },

  formatCurrency(price) {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  minsToHHMMSS(value) {
    var mins_num = parseFloat(value, 10); // don't forget the second param
    var hours   = Math.floor(mins_num / 60);
    var minutes = Math.floor((mins_num - ((hours * 3600)) / 60));
    var seconds = Math.floor((mins_num * 60) - (hours * 3600) - (minutes * 60));

    // Appends 0 when unit is less than 10
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  },
  
  removeSpecialCharacteres(value) {
    return value.replace(/[^\d]+/g,'');
  },

  async ipLookUp () {
    try {
      const response = await ip_api.get("/json");
      return response.data;
      //return utils.getAddress(response.lat, response.lon);
    } catch (err) {
      console.log('Request failed.  Returned status of', err);
    }
  },

  getAddress (latitude, longitude) {
    const GOOGLE_MAP_KEY = 'AIzaSyDiGTLiKNW40Hcp9OEEFZ6lNZnD2U0zEGs';
    $.ajax('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_MAP_KEY)
    .then(
      function success (response) {
        return response;
      },
      function fail (status) {
        console.log('Request failed.  Returned status of',
                    status);
        return status;
      }
     )
  }
};

export default utils;