const inputAddress = document.getElementById('address')
const infoAlertEl = document.getElementById('information')
const placeListEl = document.getElementById('place_list')

const apikey = '5ae2e3f221c38a28845f05b6e422b7eab10eddb80f9006e60207dc56'
const endpointAPI = 'https://api.opentripmap.com/0.1/en/places/'

const showInfoMessage = (message, alertClasses = '') => {
  infoAlertEl.className = 'alert alert-primary' + alertClasses
  infoAlertEl.innerHTML = message;
}

// generic function to fetch API
// action can be: 'geoname' or 'radius'
const getData = async (action , params = {}) => {

  params.apikey = apikey
  let baseURL = endpointAPI + action

  try {
    const { data } = await axios.get(baseURL, {params});
    return data
  } catch (error) {
    showInfoMessage('🚨 Ops... Ocorreu algum erro na aplicação! 🚨', ' alert-danger')
    console.log(error);
  }
}

const placePerPage = 5
let offset = 0
let totalPlacesFound
let longitude
let latitude

function createPlaceListDOM() {
  placeListEl.innerHTML = `
  <div class="col-12 col-lg-4 border rounded-1 px-0">
    <div class="list-group" id="list-tab" role="tablist">
    </div>
    <div class="p-1 my-1 d-flex justify-content-evenly border-bottom">
      <button class="btn btn-primary" style="font-size: 14px" type="button" id="next-button">Próximo</button>
      <button class="btn btn-primary" style="font-size: 14px; visibility: hidden;" type="button" id="previous-button">Voltar</button>
    </div>
  </div>
  <div class="col-12 col-lg-8">
    <div class="tab-content border rounded-1 py-3" id="nav-tabContent">
    </div>
  </div>
  `
}

function createListTabPanelDOM (placeXid) {
  const tabPanelEl = document.createElement('div')
  tabPanelEl.className = 'tab-pane fade'
  tabPanelEl.setAttribute('id', `list-${placeXid}`)
  tabPanelEl.setAttribute('role', 'tabpanel')
  tabPanelEl.setAttribute('aria-labelledby', `list-${placeXid}-list`)

  document.getElementById('nav-tabContent').append(tabPanelEl)
}

function showPlaceDetailsDOM (place) {
  // this function creates details place when you click on the tab,
  // and save them on the HTML side
  const tabPanelEl = document.getElementById(`list-${place.xid}`)

  tabPanelEl.innerHTML =
    `<h2 class="px-3 py-1 bg-primary text-white">📌 ${place.name}</h2>` +
    '<div class="px-3">' +
      `<p>${place.wikipedia_extracts ?
        place.wikipedia_extracts.text : place.info
        ? place.info.descr : 'Nenhuma descrição encontrada'}
      </p>` +
      `${place.preview == undefined ?
        '<p class="fst-italic py-1">Sem imagem disponivel</p>'
        :
        `<img src="${place.preview.source}"
          alt="${place.name}" class="rounded-4 text-center img-fluid shadow"
        >`}` +
    '</div>';

  // console.log(place)
}

async function createListTabItemDOM(place) {
  // this function create each tab item for the place

  let tabEl = document.createElement('a')
  tabEl.className = 'list-group-item list-group-item-action'
  tabEl.setAttribute('id', `list-${place.xid}-list`)
  tabEl.setAttribute('data-bs-toggle', 'list')
  tabEl.setAttribute('href', `#list-${place.xid}`)
  tabEl.setAttribute('role', 'tab')
  tabEl.setAttribute('aria-controls', `list-${place.xid}`)
  tabEl.textContent = place.name

  // invoke the function that create a 'pre tab content'
  // for the fade bootstrap effect
  createListTabPanelDOM(place.xid)

  tabEl.addEventListener('click', async () => {
    // when tab onclick -> show the tabpanel content (place details)
    // but ONLY if it dont have any element inside of tabpanel,
    // this is necessary to not do 'FETCH' on API everytime that the tab is clicked
    if(!(document.getElementById(`list-${place.xid}`).hasChildNodes())) {
      const placeDetailed = await getData('xid/' + place.xid)
      showPlaceDetailsDOM(placeDetailed)
    }
  });
  
  return tabEl
}

function showNextAndPreviousButtonDOM() {
  const nextBtnEl = document.getElementById('next-button')
  const previousBtnEl = document.getElementById('previous-button')

  if ((offset + placePerPage) > totalPlacesFound) {
    nextBtnEl.style.visibility = 'hidden';
  } else {
    nextBtnEl.style.visibility = 'visible';
    nextBtnEl.innerText = `Próximo (${offset + placePerPage} de ${totalPlacesFound})`
  }

  if (offset == 0) {
    previousBtnEl.style.visibility = 'hidden'
  } else {
    previousBtnEl.style.visibility = 'visible'
  }
}

async function loadPlaceList() {
  const placeListTabEl = document.getElementById('list-tab')
  const placeListContentEl = document.getElementById('nav-tabContent')

  const placeList = await getData('radius', {
    radius: 10000,
    limit: placePerPage,
    offset: offset,
    lon: longitude, lat: latitude,
    rate: 2,
    format: 'json',
  })
  
  // clear the elements that are inside of sidebar
  placeListTabEl.innerHTML = ''
  // clear elements that are on the tab content
  placeListContentEl.innerHTML = ''


  // create each place tab on the placelist element
  placeList.forEach(async (place) => {
    // console.log(place)

    // dont create list tab item if place dont have a title
    if (place.name != '') {
      const listTabItem = await createListTabItemDOM(place)
      placeListTabEl.appendChild(listTabItem)
    }
  });

  // show or dont show the buttons of next and previous page
  showNextAndPreviousButtonDOM()
  
  // console.log(placeList)
}

async function firstLoadPlaceList() {
  const countPlaceFound = await getData('radius', {
    radius: 10000,
    limit: placePerPage,
    offset: 0,
    lon: longitude, lat: latitude,
    rate: 2,
    format: 'count',
  })

  totalPlacesFound = countPlaceFound.count
  
  infoAlertEl.innerHTML += `<p class="m-0">Encontrado ${totalPlacesFound} lugares em um raio de 10km</p>`
  createPlaceListDOM()
  loadPlaceList()

  // add click event to the next and previous button
  document.getElementById('next-button').addEventListener('click', () => {
    if (offset < totalPlacesFound) {
      offset += placePerPage
      loadPlaceList();
    }
  })

  document.getElementById('previous-button').addEventListener('click', () => {
    if (offset + placePerPage > 0) {
      offset -= placePerPage
      loadPlaceList();
    }
  })
}



async function formSubmit(event) {
  event.preventDefault()

  if (inputAddress.value.trim() == '') {
    showInfoMessage('Digite um endereço valido! 😉')
    return;
  }

  const placeLocation = await getData('geoname', {
    name: inputAddress.value,
    country: 'BR'
  })

  if (placeLocation.status == 'OK') {
    showInfoMessage(`${placeLocation.name}, ${placeLocation.country}`)  

    latitude = placeLocation.lat
    longitude = placeLocation.lon

    await firstLoadPlaceList()
  } else {
    showInfoMessage('Endereço não encontrado 😔')
  }
}