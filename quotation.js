const moment = require("moment");
import swal from 'sweetalert';

import api from './api';
import utils from './utils';

const checkout_container = document.getElementById("checkout-container");

// Formulário que o usuário irá preencher
const form_quotation = document.getElementById("form-quotation");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
// Inputs dinâmicos
let cpfInput = null;
let cnpjInput = null;
let dobInput = null;
// Dinamic labels
let labelCpf = null;
let labelCnpj = null;
let labelDob = null;

// Radio Input (Permite a troca entre Pessoa Física e Pessoa Jurídica)
const pessoa_fisica = document.getElementById("pessoa-fisica");
const pessoa_juridica = document.getElementById("pessoa-juridica");
let isPessoaFisica = true; // Controla a identifação do tipo de pessoa

// Elemento que permite a troca entre cpf e cpnj
const cpf_cnpj = document.getElementById("cpf-cnpj");
// Elemento que permite colocar a data de nascimento
const dob_container = document.getElementById("dob-container");
// Cria o elemento CPF
const cpf = (ref_apped) => {
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("id", "cpf");
  input.setAttribute("name", "cpf");
  input.setAttribute("placeholder", "Informe seu CPF");
  input.required = true;

  let label = document.createElement("label");
  label.setAttribute("for", "cpf");
  label.appendChild(document.createTextNode("CPF"));

  ref_apped.appendChild(label);
  ref_apped.appendChild(input);
  $('#cpf').mask('000.000.000-00'); // Cria máscara para o cpf

  cpfInput = document.getElementById("cpf"); // Atribui input
  labelCpf = label;
}
// Cria o elemento CPNJ
const cpnj = (ref_apped) => {
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("id", "cnpj");
  input.setAttribute("name", "cnpj");
  input.setAttribute("placeholder", "Informe o CNPJ");
  input.required = true;

  let label = document.createElement("label");
  label.setAttribute("for", "cnpj");
  label.appendChild(document.createTextNode("CNPJ"));

  ref_apped.appendChild(label);
  ref_apped.appendChild(input);
  $('#cnpj').mask('00.000.000/0000-00');

  cnpjInput = document.getElementById("cnpj"); // Atribui input
  labelCnpj = label;
}
// Cria o elemento DOB (Data de Nascimento)
const dob = (ref_apped) => {
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("id", "dob");
  input.setAttribute("name", "dob");
  input.setAttribute("placeholder", "Data de Nascimento");
  input.required = true;

  let label = document.createElement("label");
  label.setAttribute("for", "dob");
  label.appendChild(document.createTextNode("Data de Nascimento"));

  ref_apped.appendChild(label);
  ref_apped.appendChild(input);
  $('#dob').mask('00/00/0000');

  dobInput = document.getElementById("dob");
  labelDob = label;
}

// Inicia como Formulário de Pessoa Física
cpf(cpf_cnpj);
dob(dob_container);

function handleChangePeopleType() {
  const value = utils.getRadioVal("radios");

    if(value === 'pessoa-fisica') {
      // Se os campos forem nulos somente
      if(!cpfInput && !dobInput) {
        // Retirar CPNJ se houver, colocar CPF e Data de Nascimento
        if(cnpjInput) {
          // remove input
          cnpjInput.remove(); 
          cnpjInput = null;
          // remove label
          labelCnpj.remove();
          labelCnpj = null;
        }

        cpf(cpf_cnpj);
        dob(dob_container);
        isPessoaFisica = true;
      }
    }
    if(value === 'pessoa-juridica') {
      // Somente se cpnj for nulo
      if(!cnpjInput) {
        // Retirar CPF, retirar Data de Nascimento e Colocar CNPJ
        cpfInput.remove(); 
        cpfInput = null;
        labelCpf.remove();
        labelCpf = null;

        dobInput.remove(); 
        dobInput = null;
        labelDob.remove();
        labelDob = null;

        cpnj(cpf_cnpj);
        isPessoaFisica = false;
      }
    }
}

// Adiciona controladores da troca
pessoa_fisica.onclick = () => handleChangePeopleType();
pessoa_juridica.onclick = () => handleChangePeopleType();

// Cria máscara para telefone
$('#phone').mask('(00)00000-0000');

class Quotation {
  constructor() {
    this.query = location.search.substring(1, location.search.length);
    this.searchParams = utils.parseQueryString(window.location.search);

    this.quotations = [];
    this.checkout = []; // Guarda os trechos escolhidos
    //this.tripMode = this.searchParams.trip_mode;
    this.userLocation = {};

    // Elements
    this.panelGroup = document.getElementById('accordion');
    this.currentPanel = 'panel-flight-info';
    this.results = document.getElementById("results");

    this.registerHandlers();
  }

  registerHandlers() {
    this.search(this.query);
    //this.getCurrentUserLocation();
  }

  async getCurrentUserLocation() {

    const userLocation = async() => {
      let data = {};
      //const GEOLOCATION =  "geolocation";

      /*GEOLOCATION in navigator ? 

      navigator.geolocation.getCurrentPosition(
        async function success (position) {
          const { coords: { latitude, longitude } } = position;
          const res = utils.getAddress(latitude, longitude);
        },
        async function error (error_message) {
          const res = await utils.ipLookUp();
        }
      ) :*/

      data = await utils.ipLookUp();

      return data;
    };

    this.userLocation = await userLocation();
  }

  async search(query) {
    this.setLoading(true);
    try {
      const response = await api.get(`/quotation?${query}`);
      this.quotations = response.data;
      this.setLoading(false);
      
      if(response.data.length > 0) {
        this.render(this.quotations, this.searchParams);
      } else {
        this.noResults();
      }
    } catch (err) {
      this.setLoading(false);
    }
  }

  setLoading(loading = true) {
    if(loading === true) {
      let span = document.createElement("span");
      span.setAttribute("class", "loader-search");

      let inner = document.createElement("div");
      inner.setAttribute("class", "inner-search");
      inner.appendChild(span);

      let preloader = document.createElement("div");
      preloader.setAttribute("id", "preloader-search");
      preloader.appendChild(inner);

      document.body.appendChild(preloader);
    } else {
      document.getElementById("preloader-search").remove();
    }
  }

  noResults() {
    let p = document.createElement("p");
    p.setAttribute("class", "no-results");
    p.appendChild(document.createTextNode("Desculpe, mas sua pesquisa não retornou nenhum resultado!"));
    this.results.appendChild(p);
  }

  render(quotations, search_params) {

    quotations.forEach((quotation, index) => {
      const { id, origin, destination, aircrafts } = quotation;
      aircrafts.sort(utils.lowerVal);

      // col stretch
      let pStretch = document.createElement('p');
      pStretch.setAttribute('style', 'font-size: 22px;');
      let pStretchContent = `<strong>${moment(search_params.departure_date.toString().split(' ')[1], 'HH:mm:ss').format('HH:mm')}</strong> ${origin.oaci_code} <i class="fas fa-angle-right"></i> <strong>${'09:30'}</strong> ${destination.oaci_code}`;
      pStretch.innerHTML = pStretchContent;
      let pAerodrome = document.createElement('p');
      pAerodrome.setAttribute("class", "stretch");
      let pAerodromeContent = `<div class="stretch"><div class="p_airport_reference" style="display:inline-block">DE</div> ${origin.name.split("/")[1] ? utils.titleize(origin.name.split("/")[1]) : utils.titleize(origin.name)}</div>
      <div class="stretch"><div class="p_airport_reference" style="display:inline-block">PARA</div> ${destination.name.split("/")[1] ? utils.titleize(destination.name.split("/")[1]) : utils.titleize(destination.name)}</div>`;
      pAerodrome.innerHTML = pAerodromeContent;
      let colStretch = document.createElement('div');
      colStretch.setAttribute('class', 'col-sm-6');
      colStretch.appendChild(pStretch);
      colStretch.appendChild(pAerodrome);
      // col time
      let colTime = document.createElement('div');
      colTime.setAttribute('class', 'col-sm-3');

      let pTimeTxt = document.createElement('p');
      pTimeTxt.appendChild(document.createTextNode("Tempo estimado"));
      pTimeTxt.setAttribute('class', 'trip-title');

      let pTime = document.createElement('p');
      pTime.setAttribute("class", "p_time_design");
      pTime.appendChild(document.createTextNode(`${utils.minsToHHMMSS(aircrafts[0].flight_time).split(":")[0]}h ${utils.minsToHHMMSS(aircrafts[0].flight_time).split(":")[1]}min`));
      
      colTime.appendChild(pTimeTxt);
      colTime.appendChild(pTime);

      // col price
      let colPrice = document.createElement('div');
      colPrice.setAttribute('class', 'col-sm-3');
      let pPrice = document.createElement('p');

      let pPriceTxt = document.createElement('p');
      pPriceTxt.appendChild(document.createTextNode("A partir de"));
      pPriceTxt.setAttribute('class', 'trip-title');

      pPrice.setAttribute('class', 'p_time_design');
      pPrice.appendChild(document.createTextNode(`${utils.formatCurrency(aircrafts[0].price)}`));
      
      colPrice.appendChild(pPriceTxt);
      colPrice.appendChild(pPrice);
      // row
      let rowTitle = document.createElement('div');
      rowTitle.setAttribute('class', 'row');
      rowTitle.appendChild(colStretch);
      rowTitle.appendChild(colPrice);
      rowTitle.appendChild(colTime);

      let a = document.createElement('a');
      a.setAttribute('role', 'button');
      a.setAttribute('data-toggle', 'collapse');
      a.setAttribute('data-parent', '#accordion');
      a.setAttribute('href', `#collapse-${index+1}`);
      a.setAttribute('aria-expanded', 'true');
      a.setAttribute('aria-controls', `collapse-${index+1}`);
      a.appendChild(rowTitle);
      let panelTitleEl = document.createElement('h4');
      panelTitleEl.setAttribute('class', 'panel-title');
      panelTitleEl.appendChild(a);

      // Panel Heading
      let panelHeadingEl = document.createElement('div');
      panelHeadingEl.setAttribute('class', 'panel-heading');
      panelHeadingEl.setAttribute('role', 'tab');
      panelHeadingEl.setAttribute('id', `heading-${index+1}`);
      panelHeadingEl.appendChild(panelTitleEl);
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      // Cols aircraft select
      // scrollbar
      let scrollbar = document.createElement('div');
      scrollbar.setAttribute('class', 'scrollbar');
      scrollbar.setAttribute('style', 'margin: 0; padding: 0;');

      aircrafts.forEach(aircraft => {
        // Thumbnail
        let thumbnail = document.createElement('img');
        thumbnail.setAttribute('style', 'width: 100%');
        thumbnail.setAttribute('src', `${aircraft.thumbnail}`);
        thumbnail.setAttribute('alt', 'aircraft select');
        let colAircraftThumbnail = document.createElement('div');
        colAircraftThumbnail.setAttribute('class', 'col-sm-5 remove-col-margin aircraft-thumbnail');
        colAircraftThumbnail.appendChild(thumbnail);
        // Info aircraft
        let infoContent = `<p class="title-aircraft-details"><strong>${aircraft.name}</strong></p>
        <p class="info-details"><strong>Quantidade de passageiros: </strong>${aircraft.passengers}</p>
        <p class="info-details"><strong>Tempo de voo: </strong>${utils.minsToHHMMSS(aircraft.flight_time).split(":")[0]}h ${utils.minsToHHMMSS(aircraft.flight_time).split(":")[1]}min</p>
        <p class="info-price">${utils.formatCurrency(aircraft.price)}</p>`;

        let info = document.createElement('div');
        info.setAttribute('class', 'aircraft-details');
        info.innerHTML = infoContent;
        let colAircraftInfo = document.createElement('div');
        colAircraftInfo.setAttribute('class', 'col-sm-7 remove-col-margin');
        colAircraftInfo.setAttribute('style', 'padding-left: 10px;');
        colAircraftInfo.appendChild(info);
        // Row aircraft select
        let rowAircraftSelect = document.createElement('div');
        rowAircraftSelect.setAttribute('class', 'row');
        rowAircraftSelect.appendChild(colAircraftThumbnail);
        rowAircraftSelect.appendChild(colAircraftInfo);
        // Aircraft select (O primeiro e o último elemento deve ser aplicado o estilo para retirar a borda).
        // Adicionar a classe 'aircraft-active' quando o elemento for selecionado!
        let aAircraft = document.createElement('a');
        aAircraft.setAttribute('class', 'list-group-item list-group-item-action');
        aAircraft.appendChild(rowAircraftSelect);
        aAircraft.onclick = () => { 
          this.showAircraftDetails(id, aircraft, origin, destination, index); 
        }
        scrollbar.appendChild(aAircraft); // APPEND ELEMENTS TO SCROLLBAR
      });

      // Col Aircraft Select
      let colAircraftSelect = document.createElement('div');
      colAircraftSelect.setAttribute('class', 'col-sm-5');
      colAircraftSelect.setAttribute('style', 'margin: 0; padding: 0; margin-bottom: 5px;');
      colAircraftSelect.appendChild(scrollbar);

      // COL AIRCRAFT DETAILS
      let clickToDetails = document.createElement('div');
      clickToDetails.setAttribute('class', 'select-aircraft-to');
      clickToDetails.appendChild(document.createTextNode('Selecione uma aeronave para detalhes!'));
      let colAircraftDetails = document.createElement('div');
      colAircraftDetails.setAttribute('class', 'col-sm-7');
      colAircraftDetails.setAttribute('id', `aircraft-details-${index+1}`);
      colAircraftDetails.appendChild(clickToDetails);

      // Row Body
      let rowBody = document.createElement('div');
      rowBody.setAttribute('class', 'row');
      rowBody.appendChild(colAircraftSelect);
      rowBody.appendChild(colAircraftDetails);

      // Panel body
      let panelBodyEl = document.createElement('div');
      panelBodyEl.setAttribute('class', 'panel-body');
      panelBodyEl.appendChild(rowBody);

      // Panel Collapse
      let panelCollapseEl = document.createElement('div');
      panelCollapseEl.setAttribute('class', 'panel-collapse collapse in');
      panelCollapseEl.setAttribute('id', `collapse-${index+1}`);
      panelCollapseEl.setAttribute('role', 'tabpanel');
      panelCollapseEl.setAttribute('aria-labelledby', `heading-${index+1}`);
      panelCollapseEl.appendChild(panelBodyEl);

      // Panel
      let panelEl = document.createElement('div');
      panelEl.setAttribute('class', 'panel panel-default');
      panelEl.appendChild(panelHeadingEl);
      panelEl.appendChild(panelCollapseEl);

      // APPEND TO PANEL GROUP
      this.panelGroup.appendChild(panelEl);
    });

    $('.panel-collapse').on('show.bs.collapse', function () {
      $(this).siblings('.panel-heading').addClass('active');
    });
    
    $('.panel-collapse').on('hide.bs.collapse', function () {
      $(this).siblings('.panel-heading').removeClass('active');
    });
  }

  showAircraftDetails(id, aircraft, origin, destination, index) {
    const { aircraftImages, company } = aircraft;

    /**AIRCARFT ERROR */
    let aircraftDetails = document.getElementById(`aircraft-details-${index+1}`);
    aircraftDetails.innerHTML = '';
    
    let galleryEl = document.createElement('div');
    galleryEl.setAttribute('class', 'slider slider-nav');
    galleryEl.setAttribute('style', 'margin: 0; padding: 0;');
    galleryEl.setAttribute('id', `lightgallery-${index+1}`);
    // SLIDER
    let sliderEl = document.createElement('div');
    sliderEl.setAttribute('class', 'slider slider-for');
    sliderEl.setAttribute('id', `slider-${index+1}`);

    // Adicionar todos os slides ao slider
    aircraftImages.forEach(el => {
      // Elements for slider
      let slide = document.createElement('div');
      let slideImg = document.createElement('img');
      slideImg.setAttribute('src', el.url);
      slideImg.setAttribute('style', 'width: 100%;');
      slide.appendChild(slideImg);
      sliderEl.appendChild(slide);

      // Elements for gallery
      let img = document.createElement('img');
      img.setAttribute('src', el.url);
      let a = document.createElement('a');
      a.setAttribute('href', "");
      a.appendChild(img);
      let srcDiv = document.createElement('div');
      srcDiv.setAttribute('data-src', el.url);
      srcDiv.setAttribute('class', 'item-gallery');
      srcDiv.appendChild(a);

      galleryEl.appendChild(srcDiv);
    });
    

    let titleDesc = document.createElement('p');
    titleDesc.setAttribute('class', 'title-description padding-0');
    titleDesc.appendChild(document.createTextNode(aircraft.name));
    let aircraftDesc = document.createElement('p');
    aircraftDesc.setAttribute('class', 'aircraft-description padding-0');
    aircraftDesc.appendChild(document.createTextNode(aircraft.description));

    let rowSpec = document.createElement('div');
    rowSpec.setAttribute('class', 'row');
    // company
    let colCompany = document.createElement('div');
    colCompany.setAttribute('class', 'col-sm-8');
    colCompany.setAttribute('style', 'height: 26px;');
    let companyEl = `<img style="width: 20%;" src="assets/images/logo.png" alt="air taxi logo example"> Operado por <strong>Piquiatuba Táxi Aéreo</strong>`;
    colCompany.innerHTML = companyEl;
    // flight price
    let colFlightPrice = document.createElement('div');
    colFlightPrice.setAttribute('class', 'col-sm-4');
    colFlightPrice.setAttribute('style', 'height: 26px;');
    let price = `<p class="price-flight"><strong>${utils.formatCurrency(aircraft.price)}</strong></p>`;
    colFlightPrice.innerHTML = price;
    rowSpec.appendChild(colCompany);
    rowSpec.appendChild(colFlightPrice);
    // Button end
    let btn = document.createElement('a');
    btn.setAttribute("href", "#");
    btn.setAttribute('class', 'btn btn-add');
    btn.appendChild(document.createTextNode('SELECIONAR'));

    btn.onclick = () => {
      this.checkout = [];
      this.checkout.push({
        id,
        origin,
        destination,
        aircraft,
      });
      this.showCheckout();
    }

    let nextBtn = document.createElement('div');
    nextBtn.setAttribute('class', 'text-end');
    nextBtn.appendChild(btn);

    aircraftDetails.appendChild(sliderEl);
    aircraftDetails.appendChild(galleryEl);
    aircraftDetails.appendChild(titleDesc);
    aircraftDetails.appendChild(aircraftDesc);
    aircraftDetails.appendChild(rowSpec);
    aircraftDetails.appendChild(nextBtn);

    $(`#lightgallery-${index+1}`).lightGallery({
      download: false,
      share: false,
      zoom: false,
      pager: false,
      fullScreen: false,
      autoplay: false,
      autoplayControls: false,
      selector: '.item-gallery'
    });

    $(`#slider-${index+1}`).slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      //fade: true,
      asNavFor: `#lightgallery-${index+1}`
    });
  
    $(`#lightgallery-${index+1}`).slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: `#slider-${index+1}`,
      dots: false, // indicators
      centerMode: true,
      focusOnSelect: true,
      arrows: false,
    });
  }

  sendQuotation(event, subtotal) {
    event.preventDefault();

    // Obter os dados do formulário
    const user = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
    };

    if(isPessoaFisica) { // se for pessoa física
      user.cpf = utils.removeSpecialCharacteres(cpfInput.value);
      user.dob = `${dobInput.value.split("/")[2]}-${dobInput.value.split("/")[1]}-${dobInput.value.split("/")[0]}`;
      user.type = "pessoa-fisica";
    } else { // se for pessoa jurídica
      user.cnpj = utils.removeSpecialCharacteres(cnpjInput.value);
      user.type = "pessoa-juridica";
    }

    this.submitQuotation({
      search: this.searchParams,
      user,
      userLocation: null,
      stretch: this.checkout[0],
      subtotal,
    });
  }

  submitQuotation(data) {
    swal({
      title: "Finalizar cotação e enviar pedido?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async(willSend) => {

      if(willSend){
        this.setLoading(true);
        try {
          await api.post(`/quotation/send`, data);
          this.setLoading(false);

          swal("Seu pedido foi enviado, brevemente entraremos em contato!", {
            icon: "success",
          }).then(() => {
            window.location = "index.html";
          });
        } catch (error) {
          this.setLoading(false);
          swal(
            "Ocorreu um erro ao processar sua requisição :(", 
            `Por favor, tente novamente mais tarde!`, 
            "error",
          )
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  removeItemFromCheckout(id) {
    const removed = this.checkout.filter(item => item.id !== id);
    this.checkout = removed;
    this.showCheckout();
  }

  showCheckout() {
    checkout_container.innerHTML = "";
    let subtotal = 0;

    if(this.checkout.length > 0) {
      let checkout = document.createElement("div");
      checkout.setAttribute("class", "checkout");

      let title = document.createElement("h3");
      title.appendChild(document.createTextNode("Resumo do pedido"));

      // Os itens são adicionados aqui dentro
      //let scrollbar = document.createElement("div");
      //scrollbar.setAttribute("class", "checkout-scrollbar");

      let subtotalEl = document.createElement("p");
      subtotalEl.setAttribute("class", "sub-total");

      let buttonSubmit = document.createElement("button");
      buttonSubmit.appendChild(document.createTextNode("Receba uma proposta"));
      buttonSubmit.setAttribute("data-toggle", "modal");
      buttonSubmit.setAttribute("data-target", "#checkoutModal");

      checkout.appendChild(title);

      // Iterar sobre os itens
      this.checkout.forEach(el => {

        const { id, origin, destination, aircraft } = el;

        subtotal += aircraft.price;

        let checkoutItem = document.createElement("div");
        checkoutItem.setAttribute("class", "row checkout-item");

        checkoutItem.innerHTML = `<div class="col-sm-4">
        <img src="${aircraft.thumbnail}" />
        </div>
        <div class="col-sm-8 checkout-info">
          <p class="aircraft-name">${aircraft.name}</p>
          <p><p class="p-title">Origem:</p> ${origin.name.split("/")[1] ? utils.titleize(origin.name.split("/")[1]) : utils.titleize(origin.name)}, ${utils.titleize(origin.city)}, ${origin.uf}</p>
          <p><p class="p-title">Destino:</p> ${destination.name.split("/")[1] ? utils.titleize(destination.name.split("/")[1]) : utils.titleize(destination.name)}, ${utils.titleize(destination.city)}, ${destination.uf}</p>
          <p><p class="p-title">Preço:</p> ${utils.formatCurrency(aircraft.price)}</p>
          <p><p class="p-title">Tempo de Viagem:</p> ${utils.minsToHHMMSS(aircraft.flight_time).split(":")[0]}h ${utils.minsToHHMMSS(aircraft.flight_time).split(":")[1]}min</p>
        </div>`;

        //let removeItemBtn = document.createElement("button");
        //removeItemBtn.setAttribute("class", "removeItemBtn");
        //removeItemBtn.appendChild(document.createTextNode("Remover"));
        //removeItemBtn.onclick = () => this.removeItemFromCheckout(id);

        //checkoutItem.appendChild(removeItemBtn);

        //scrollbar.appendChild(checkoutItem);
        
        //@1
        checkout.appendChild(checkoutItem);
      });

      // Mostra o total a pagar
      subtotalEl.appendChild(document.createTextNode(`Subtotal: ${utils.formatCurrency(subtotal)}`));

      // checkout.appendChild(scrollbar); // trocar por @1
      checkout.appendChild(subtotalEl);
      checkout.appendChild(buttonSubmit);

      checkout_container.appendChild(checkout);
      form_quotation.onsubmit = (event) => this.sendQuotation(event, subtotal);
    }
  }
}

const quotation = new Quotation();