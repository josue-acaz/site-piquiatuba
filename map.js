var neighborhoods = [
  {lat: -2.43, lng: -54.7}, // Santarém
  {lat: 0.03, lng: -51.05}, // Macapá
  {lat: 2.82, lng: -60.66}, // Boa vista
  {lat: -3.01, lng: -60}, // Manaus
  {lat: -6.751604, lng: -51.077487}, // Urilandia do Norte
  {lat: -1.45, lng: -48.5}, // Belém
  {lat: -13.55, lng: -52.27}, // Canarana
  {lat: -4.27, lng: -55.98}, // Itaituba
  {lat: -8.025725, lng: -50.032860}, // Redenção
];

var bases = [
{
  name: 'Santarém',
  image: 'assets/images/baseSantarém.jpeg',
  title: 'Piquiatuba Táxi Aéreo - Santarém - PA',
  address_1: 'Rodovia Santarém/Cuiabá, S/N, KM 13, s/n , S/N',
  address_2: 'CEP: 68005-560 - Santarém - PA, SNCJ'
},
{
  name: 'Macapá',
  image: 'assets/images/baseMacapá.jpg',
  title: 'Piquiatuba Táxi Aéreo - Macapá - AP',
  address_1: 'Sítio à Rodovia Duca Serra, S/N, Bairro Marabaixo',
  address_2: 'CEP: 68906-301 - Macapá - AP'
},
{
  name: 'Boa vista',
  image: 'assets/images/baseBoaVista.jpeg',
  title: 'Piquiatuba Táxi Aéreo - Boa Vista - RR',
  address_1: 'Praça Santos Dumont, 100',
  address_2: 'CEP: 69310-006 - Boa Vista - RR, SBBV'
},
{
  name: 'Manaus',
  image: 'assets/images/baseManaus.jpg',
  title: 'Piquiatuba Táxi Aéreo - Manaus - AM',
  address_1: 'Avenida Professor Nilton Lins, 300, Flores',
  address_2: 'CEP: 69058-400 - Manaus - AM, SWFN'
},
{
  name: 'Ourilândia do Norte',
  image: 'assets/images/baseOurilândiaDoNorte.jpg',
  title: 'Piquiatuba Táxi Aéreo - Ourilândia do Norte - PA',
  address_1: 'Rodovia PA 279, KM 152, S/N',
  address_2: 'CEP: 68390-000 - Ourilândia do Norte - PA, SDOW'
},
{
  name: 'Belém',
  image: 'assets/images/baseBelém.jpeg',
  title: 'Piquiatuba Táxi Aéreo - Belém-PA',
  address_1: 'Av. Júlio César, S/N, Hangar 05, S/N',
  address_2: 'CEP: 66115-970 - Belém-PA'
},
{
  name: 'Canarana',
  image: 'assets/images/baseCanarana.jpg',
  title: 'Piquiatuba Táxi Aéreo - Canarana - MT',
  address_1: 'Rua Serra Dourada, S/N',
  address_2: 'CEP: 68005-560 - Canarana - MT, SWEK'
},
{
  name: 'Itaituba',
  image: 'assets/images/baseItaituba.jpg',
  title: 'Piquiatuba Táxi Aéreo - Itaituba - PA',
  address_1: 'Rodovia Transamazonica , km 05, hangar I, S/N',
  address_2: 'CEP: 68180-000 - Itaituba - PA, SBIH'
},
{
  name: 'Redenção',
  image: 'assets/images/baseRedenção.jpeg',
  title: 'Piquiatuba Táxi Aéreo - Redenção - PA',
  address_1: 'Rodovia PA287, KM 06, Hangar Reta, Setor Reta, Setor Oeste',
  address_2: 'Redenção - PA, SNDC'
}];

var markers = [];
var map;

function initMap() {
    
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: -5.86, lng: -54.7},
  });
  drop();
}

function drop() {
  clearMarkers();
  for (var i = 0; i < neighborhoods.length; i++) {
    addMarkerWithTimeout(map, neighborhoods[i], i * 300, i);
  }
}

function addMarkerWithTimeout(map, position, timeout, index) {

  var image = {
    url: 'assets/images/marker.png',
    // This marker is 20 pixels wide by 32 pixels high.
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(20.5, 68)
  };

  window.setTimeout(function() {
    markers.push(new google.maps.Marker({
      position: position,
      map: map,
      draggable: false,
      animation: google.maps.Animation.DROP,
      icon: image
    }));

    // Info Windows
    var contentString = 
    '<div id="content" style="height:18em; width:16em;">'+
      '<img mat-card-image src='+bases[index].image+' style="height:8em; width:16em" alt="Foto da base">'+
      '<div id="bodyContent">'+
        '<p style="font-weight: bold; margin: 0;">'+bases[index].title+'</p>'+
        '<p style="margin: 20px 0px 0px 0px;">'+bases[index].address_1+'</p>'+
        '<p style="margin: 0;">'+bases[index].address_2+'</p>'+
      '</div>'+
    '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    markers[index].addListener('mouseover', () => {
      infowindow.open(map, markers[index]);
    });

    markers[index].addListener('mouseout', () => {
      infowindow.close();
    });
  }, timeout);
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}