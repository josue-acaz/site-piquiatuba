import flatpickr from 'flatpickr';

import api from './api';
import utils from './utils';

let aeromedical_transport = document.getElementById("aeromedical_transport");
let passengers_transport = document.getElementById("passengers_transport");
let passengers = null;

let is_aeromedical_transport = false;
let passengers_aeromedical = document.getElementById("passengers_aeromedical");
let covid = false; // Diz se é suspeita de covid

// Mostrar erros
let snackbar = document.getElementById("snackbar");

class App {
  constructor() {

    this.btnSubmit = document.getElementById("search-btn");
    this.handleCreatePassengersInput();
    this.registerHandlers();

    // Inputs elements
    this.originEl = document.getElementById("city-origin");
    this.destinationEl = document.getElementById("city-destination");
    this.colDepartureDate = document.getElementById("col-departure-date");
    this.colPassengers = document.getElementById("col-passengers");

    // Values
    this.cityOriginValue = null;
    this.cityDestinationValue = null;
    this.departureDateTime = null;
    this.passengers = 1;
  }

  registerHandlers() {
    this.btnSubmit.onclick = (event) => {
      event.preventDefault();

      this.handleSubmit();
    }
    
    aeromedical_transport.onclick = () => this.handleTransportMode();
    passengers_transport.onclick = () => this.handleTransportMode();
  }

  handleCreatePassengersInput() {
    passengers_aeromedical.innerHTML = "";

    let label = document.createElement("label");
    label.setAttribute("class", "label-input-search");
    label.setAttribute("for", "passengers");
    label.appendChild(document.createTextNode("NÚMERO DE PASSAGEIROS"));

    let inputWithIcon = document.createElement("div");
    inputWithIcon.setAttribute("class", "input-with-icon");
    inputWithIcon.setAttribute("id", "passengers-input");

    let input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("min", "1");
    input.setAttribute("id", "passengers");
    input.setAttribute("placeholder", "Número de passageiros");

    let icon = document.createElement("i");
    icon.setAttribute("style", "font-size: 28px;");
    icon.setAttribute("class", "material-icons");
    icon.appendChild(document.createTextNode("airline_seat_recline_normal"));

    inputWithIcon.appendChild(input);
    inputWithIcon.appendChild(icon);

    passengers_aeromedical.appendChild(label);
    passengers_aeromedical.appendChild(inputWithIcon);

    passengers = input;
    passengers.value = 1;
    passengers.onchange = (event) => this.passengers = event.target.value;
  }

  handleCreateCovidSelect() {
    passengers_aeromedical.innerHTML = "";

    let btnYesCovid = document.createElement("button");
    btnYesCovid.setAttribute("id", "btn_selected_covid");
    btnYesCovid.setAttribute("type", "button");
    btnYesCovid.setAttribute("class", "btn");

    btnYesCovid.classList.add("btn_not_selected_covid");
    btnYesCovid.appendChild(document.createTextNode("SIM"));

    let btnNotCovid = document.createElement("button");
    btnNotCovid.setAttribute("id", "btn_not_selected_covid");
    btnNotCovid.setAttribute("type", "button");
    btnNotCovid.setAttribute("class", "btn");

    btnNotCovid.classList.add("btn_selected_covid");

    btnNotCovid.appendChild(document.createTextNode("NÃO"));

    let btnGroup =  document.createElement("div");
    btnGroup.setAttribute("id", "select-covid");
    btnGroup.setAttribute("class", "btn-group");
    btnGroup.setAttribute("role", "group");

    let label = document.createElement('label');
    label.setAttribute('class', 'label-input-search');
    label.setAttribute('for', 'select-covid');
    label.appendChild(document.createTextNode("SUSPEITA DE COVID-19?"));

    btnYesCovid.onclick = () => {
      if(!covid) {
        this.handleChangeCovidOption(btnYesCovid, btnNotCovid)
      }
    };
    btnNotCovid.onclick = () => {
      if(covid) {
        this.handleChangeCovidOption(btnYesCovid, btnNotCovid)
      }
    };

    btnGroup.appendChild(btnYesCovid);
    btnGroup.appendChild(btnNotCovid);

    // A PARTIR DAQUI
    passengers_aeromedical.appendChild(label);
    passengers_aeromedical.appendChild(btnGroup);
  }

  handleChangeCovidOption(btnYes, btnNot) {
    covid = !covid;
    if(covid) {
      btnYes.classList.remove("btn_not_selected_covid");
      btnYes.classList.add("btn_selected_covid");

      btnNot.classList.remove("btn_selected_covid");
      btnNot.classList.add("btn_not_selected_covid");
    } else {
      btnYes.classList.remove("btn_selected_covid");
      btnYes.classList.add("btn_not_selected_covid");

      btnNot.classList.remove("btn_not_selected_covid");
      btnNot.classList.add("btn_selected_covid");
    }
  }

  handleTransportMode() {
    const value = utils.getRadioVal("radios");

    if(value === 'aeromedical_transport') {
      this.handleCreateCovidSelect();
      is_aeromedical_transport = true;
    }
    if(value === 'passengers_transport') {
      this.handleCreatePassengersInput();
      is_aeromedical_transport = false;
    }
  }

  // Validate form and submit
  handleSubmit() {

    const data = {
      origin: this.cityOriginValue,
      destination: this.cityDestinationValue,
      departure_date: this.departureDateTime,
      passengers_: parseInt(this.passengers),
      is_aeromedical_transport,
      covid,
    };

    // VALIDAÇÕES
    // Origin
    if(!data.origin) {
      this.originEl.classList.toggle("error-input");
    }

    // Destination
    if(!data.destination) {
      this.destinationEl.classList.toggle("error-input");
    }

    // Data de partida
    if(!data.departure_date) {
      this.colDepartureDate.classList.toggle("error-input");
    }
    // Número de passageiros
    if(!data.passengers_) {
      this.colPassengers.classList.toggle("error-input");
    }

    // Mostra snackbar "Preencha todos os campos" se os campos estão vazios
    if(
      !data.origin || 
      !data.destination || 
      !data.departure_date || 
      !data.passengers_
      ) {

      this.showSnackbar("Preencha todos os campos!");
    } else {
      // OUTRAS VALIDAÇÕES

      // validar hora da data da ida
      if(!this.validateDepartureDate(data.departure_date, 4)) {
        this.showSnackbar("A data da ida deve anteceder em até 4 horas a data atual!");
      } else {

        let search = {
          origin: `${data.origin.split(" • ")[0]}, ${data.origin.split(" • ")[1]}`,
          destination: `${data.destination.split(" • ")[0]}, ${data.destination.split(" • ")[1]}`,
          departure_date: data.departure_date,
          passengers_: data.passengers_,
          is_aeromedical_transport: data.is_aeromedical_transport,
        };

        if(is_aeromedical_transport) {
          search.covid = data.covid;
        }
        
        this.search(search);
      }
    }
  }

  // Pesquisa
  search(data) {
    const query = utils.buildQueryString(data);
    window.location = `quotation.html?${query}`;
  }

  // Mostra o erro
  showSnackbar(text) {
    snackbar.className = "show";
    snackbar.innerHTML = "";
    snackbar.appendChild(document.createTextNode(text));
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
  }

  // Verifica se a hora da data de partida tem até 3 horas no futuro
  validateDepartureDate(date, hours) {
    let timeIsValid = true;

    const today = new Date(); // Data de hoje com 4 horas adicionadas
    today.setHours(today.getHours()+hours);

    const selectedDate = new Date(date);

    if(selectedDate.getTime() < today.getTime()) {
      timeIsValid = false;
    }

    return timeIsValid;
  }

  // Set origin value
  handleOriginSelected(value) {
    this.cityOriginValue = value.name;
  }

  // Set destination value
  handleDestinationSelected(value) {
    this.cityDestinationValue = value.name;
  }
}

const app = new App();

/**Out scripts */
// Cidade de Origem
var $select_origin = $('#select-origin').selectize({
  valueField: 'name', // É o valor que vai ser retornado do input
  labelField: 'name', // É o que vai aparecer no input
  searchField: 'name',
  create: false,
  render: {
    option: function(city, escape) {
      return(`
        <p class="selectize-option-txt">${city.name}</p>
      `);
    }
  },
  load: function(text, callback) {
    const query = utils.buildQueryString({
      filter: "city",
      text,
    });
    $.ajax({
      url: `${process.env.API_URL}/autocomplete/?${query}`,
      type: 'GET',
      cache: true,
      async: true,
      error: function() {
        callback();
      },
      success: function(res) {
        callback(res);
      }
    });
  }
});

var selectize_origin = $select_origin[0].selectize;
// Adiciona o valor da cidade de origem
selectize_origin.on('item_add', function(value, item){
  const city = selectize_origin.sifter.items[value];
  app.handleOriginSelected(city);
});

// Cidade de destino
var $select_destination = $('#select-destination').selectize({
  valueField: 'name', // É o valor que vai ser retornado do input
  labelField: 'name', // É o que vai aparecer no input
  searchField: 'name',
  create: false,
  render: {
    option: function(city, escape) {
      return(`
        <p class="selectize-option-txt">${city.name}</p>
      `);
    }
  },
  load: function(text, callback) {
    const query = utils.buildQueryString({
      filter: "city",
      text,
    });
    $.ajax({
      url: `${process.env.API_URL}/autocomplete/?${query}`,
      type: 'GET',
      cache: true,
      async: true,
      error: function() {
        callback();
      },
      success: function(res) {
        callback(res);
      }
    });
  }
});

var selectize_destination = $select_destination[0].selectize;
// Adiciona o valor da cidade de origem
selectize_destination.on('item_add', function(value, item){
  const city = selectize_destination.sifter.items[value];
  app.handleDestinationSelected(city);
});

// Controla a ativação, desativação da data da volta
let isRoundTrip = true;
// Data e hora da partida
const departureDatePicker = flatpickr(".departure-datetime", {
  enableTime: true,
  time_24hr: true,
  minDate: "today",
  maxDate: (new Date()).fp_incr(365),
  onClose: (selectedDates, dateStr, instance) => {
    // Altera o valor da data de partida
    app.departureDateTime = dateStr;
  }
});