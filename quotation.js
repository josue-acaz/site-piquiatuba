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

$('#phone').mask('(00)00000-0000');

class Quotation {
  constructor() {
    this.query = location.search.substring(1, location.search.length);
    this.searchParams = utils.parseQueryString(window.location.search);

    this.quotations = [];
    this.checkout = []; // Guarda os trechos escolhidos
    this.tripMode = this.searchParams.trip_mode;

    // Elements
    this.panelGroup = document.getElementById('accordion');
    this.currentPanel = 'panel-flight-info';

    this.registerHandlers();
  }

  registerHandlers() {
    this.search(this.query);
  }

  async search(query) {
    this.setLoading(true);
    try {
      const response = await api.get(`/quotation?${query}`);
      this.quotations = response.data;
      this.setLoading(false);
      this.render(this.quotations, this.searchParams);
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
      let pAerodromeContent = `<p class="stretch"><strong>DE</strong> ${origin.name.split("/")[1] ? utils.titleize(origin.name.split("/")[1]) : utils.titleize(origin.name)}</p>
      <p class="stretch"><strong>PARA</strong> ${destination.name.split("/")[1] ? utils.titleize(destination.name.split("/")[1]) : utils.titleize(destination.name)}</p>`;
      pAerodrome.innerHTML = pAerodromeContent;
      let colStretch = document.createElement('div');
      colStretch.setAttribute('class', 'col-sm-6');
      colStretch.appendChild(pStretch);
      colStretch.appendChild(pAerodrome);
      // col time
      let colTime = document.createElement('div');
      colTime.setAttribute('class', 'col-sm-3');
      let pTime = document.createElement('p');
      pTime.setAttribute('style', 'font-size: 14px;');
      pTime.appendChild(document.createTextNode(`Aproximadamente ${'1h'}`));
      colTime.appendChild(pTime);
      // col price
      let colPrice = document.createElement('div');
      colPrice.setAttribute('class', 'col-sm-3');
      let pPrice = document.createElement('p');
      pPrice.setAttribute('style', 'font-size: 14px;');
      pPrice.appendChild(document.createTextNode(`A partir de ${utils.formatCurrency(aircrafts[0].price)}`));
      colPrice.appendChild(pPrice);
      // row
      let rowTitle = document.createElement('div');
      rowTitle.setAttribute('class', 'row');
      rowTitle.appendChild(colStretch);
      rowTitle.appendChild(colTime);
      rowTitle.appendChild(colPrice);

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
        <p class="info-details"><strong>Passageiros:</strong> ${aircraft.passengers}</p>
        <p class="info-details"><strong>Velocidade de cruzeiro: </strong>${aircraft.cruising_speed} Km/h</p>
        <p class="info-price">por <strong>${utils.formatCurrency(aircraft.price)}</strong></p>`;

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
    colCompany.setAttribute('class', 'col-sm-6');
    colCompany.setAttribute('style', 'height: 26px;');
    let companyEl = `<img style="width: 10%;" src="assets/images/logo.png" alt="air taxi logo example"> Operado por <strong>Fly Táxi Aéreo</strong>`;
    colCompany.innerHTML = companyEl;
    // flight price
    let colFlightPrice = document.createElement('div');
    colFlightPrice.setAttribute('class', 'col-sm-6');
    colFlightPrice.setAttribute('style', 'height: 26px;');
    let price = `<p class="price-flight"><strong>${utils.formatCurrency(aircraft.price)}</strong></p>`;
    colFlightPrice.innerHTML = price;
    rowSpec.appendChild(colCompany);
    rowSpec.appendChild(colFlightPrice);
    // Button end
    let btn = document.createElement('button');
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

      if(this.tripMode === "roundtrip") {
        this.checkout.push({
          id: id+1,
          origin: destination,
          destination: origin,
          aircraft,
        });
      }

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

  sendQuotation(event) {
    event.preventDefault();

    // Obter os dados do formulário
    const user = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
    };

    this.submitQuotation({
      user,
      stretches: this.quotations,
    });
  }

  submitQuotation(data) {
    swal({
      title: "Finalizar cotação e enviar pedido?",
      //text: "Uma vez excluído, você não poderá recuperar este arquivo!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then(async(willSend) => {

      if(willSend){
        this.setLoading(true);
        try {
          console.log(data);
          const response = await api.post(`/quotation/send`);
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
      let scrollbar = document.createElement("div");
      scrollbar.setAttribute("class", "checkout-scrollbar");

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
          <p><p class="p-title">Tempo de Viagem:</p> 2hrs</p>
        </div>`;

        let removeItemBtn = document.createElement("button");
        removeItemBtn.setAttribute("class", "removeItemBtn");
        removeItemBtn.appendChild(document.createTextNode("Remover"));
        removeItemBtn.onclick = () => this.removeItemFromCheckout(id);

        checkoutItem.appendChild(removeItemBtn);

        scrollbar.appendChild(checkoutItem);
      });

      // Mostra o total a pagar
      subtotalEl.appendChild(document.createTextNode(`Subtotal: ${utils.formatCurrency(subtotal)}`));

      checkout.appendChild(scrollbar);
      checkout.appendChild(subtotalEl);
      checkout.appendChild(buttonSubmit);

      checkout_container.appendChild(checkout);
      form_quotation.onsubmit = (event) => this.sendQuotation(event);
    }
  }
}

const quotation = new Quotation();