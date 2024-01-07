// Setup Map
let homePosition = [51.505, -0.09];

let map = L.map('map').setView(homePosition,13);
map.setZoom(6.5);

let pointerIcon = L.icon({
    iconUrl: "images/pin.png",
    iconSize: [35,35],
    iconAnchor: [2,33],
    popupAnchor: [7,-40]
});
let markerIcon = L.icon({
    iconUrl: "leaflet/images/marker-icon.png",
    iconSize: [25,40],
    iconAnchor: [17,17],
    popupAnchor: [7,-40]
});
let small_airport_icon = L.icon({
    iconUrl: "images/small_airport.png",
    iconSize: [50,50],
    iconAnchor: [25,25],
    popupAnchor: [0,-25]
});
let medium_airport_icon = L.icon({
    iconUrl: "images/medium_airport.png",
    iconSize: [60,70],
    iconAnchor: [30,35],
    popupAnchor: [0,-25]
});
let large_airport_icon = L.icon({
    iconUrl: "images/large_airport.png",
    iconSize: [35,35],
    iconAnchor: [13,13],
    popupAnchor: [0,-25]
});
let heliport_icon = L.icon({
    iconUrl: "images/heliport.png",
    iconSize: [35,35],
    iconAnchor: [13,13],
    popupAnchor: [0,-25]
});
let danger_icon = L.icon({
    iconUrl: "images/danger.png",
    iconSize: [40,40],
    iconAnchor: [20,35],
    popupAnchor: [0,-25]
})
let closed_icon = L.icon({
    iconUrl: "images/cross.png",
    iconSize: [15,15],
    iconAnchor: [7,7],
    popupAnchor: [0,-7]
});

let icons = {
    'small_airport': small_airport_icon,
    'medium_airport': medium_airport_icon,
    'large_airport': large_airport_icon,
    'heliport': heliport_icon,
    'closed': closed_icon,
    'danger': danger_icon,
    'important': danger_icon
}
let locationMarker = L.marker(homePosition, {
    draggable: true
})
let searchMarker = L.marker(homePosition, {
    icon: pointerIcon,
    draggable: true
});
let rangeMarker = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 20000
})


searchMarker.draggable = true;
searchMarker.addTo(map);
searchMarker.bindPopup("This represents your search location or target.");

locationMarker.draggable = true;
locationMarker.addTo(map);
locationMarker.bindPopup("This represents your location.");

rangeMarker.addTo(map);
rangeMarker.bindPopup("Visual representation of range.")

let searchLocationLat = fromId("search-location-lat")
let searchLocationLng = fromId("search-location-lng")
let searchRange = fromId("search-range")
searchLocationLat.onchange = function() {
    let location = searchMarker.getLatLng();
    console.log(location);
    searchMarker.setLatLng([Number(searchLocationLat.value),location.lng]);
};
searchLocationLng.onchange = function() {
    let location = searchMarker.getLatLng();
    console.log(location);
    searchMarker.setLatLng([location.lat,Number(searchLocationLng.value)]);
};
searchRange.onchange = function() {
    rangeMarker.setRadius(Number(searchRange.value)*1000);
}

let detailMenuList = fromId("detail-menu-list")
var entities = [];
let findButton = fromId("search-menu-button");
let newEntityButton = fromId("new-entity-button")

function createItem(content) {
    return '<div id="range" class="item" style="display:block;">'+content+'</div>'
}

function round(number,decimals) {
    return Math.round(number*Math.pow(10,decimals))/Math.pow(10,decimals)
}

function createInput(name,value,id,large) {
    return '<div class="item" style="display:block;">' +
        '<label class="unselectable">' +
            name +
            '<input style="width:140px;" id="' + "detail-menu-" + id + '" value="' + value + '"></input>' +
        '</label>' +
    '</div>'
}

let typeNameConvertToClient = {
    "small_airport": "Small Airport",
    "large_airport": "Large Airport",
    "medium_airport": "Medium Airport",
    "heliport": "Heliport",
    "closed": "Closed"
}
let typeNameConvertToServer = {
    "small airport": "small_airport",
    "large airport": "large_airport",
    "medium airport": "medium_airport",
    "heliport": "heliport",
    "closed": "closed",
}
function getInput(name) {
    return fromId("detail-menu-"+name).value
}

function tryConvertTypeNameToClient(name) {
    let conversion = typeNameConvertToClient[name.toLowerCase()]
    console.log(conversion)
    if (!conversion) { conversion = name.toLowerCase(); }
    console.log(conversion);
    return conversion;
}

function tryConvertTypeNameToServer(name) {
    let conversion = typeNameConvertToServer[name.toLowerCase()]
    console.log(conversion)
    if (!conversion) { conversion = name.toLowerCase(); }
    console.log(conversion);
    return conversion;
}

let submitEntityButton = fromId("push-entity-button")

function createEntityElements(values) {
    return createInput("Name: ",values.name,"name")+
    createInput("Lat: ",values.lat,"lat")+
    createInput("Lng: ",values.lng,"lng")+
    createInput("Type: ",values.type,"type")+
    createInput("Id: ",values.id,"id")+
    createInput("Info: ",values.info,"info",true)+
    createInput("Code: ",values.code,"code",true)+
    createItem('<a class="bar-menu-text" href="https://ourairports.com/airports/"'+values.code+'>'+values.code+'</a>')+
    createItem('<a class="bar-menu-text">'+"Distance: "+values.distance+'</a>')
}
function findEntities() {
    for (let i = 0; i < entities.length; i++) {
        entities[i].marker.remove();
    }
    entities = [];
    const request = new Request("/find/" + searchLocationLat.value + "," + searchLocationLng.value+","+searchRange.value, {
        method: "GET"
    });
    fetch(request).then((response) => {
        if (response.status === 200) {
            return response.json();
        } else {
            throw new Error("Something went wrong on API server!");
        }
    }).then((response) => {
        for (let i = 0; i < response.length; i++) {
            let obj = response[i];
            let icon = icons[obj['type']]
            if (!icon) {icon = markerIcon;}
            let entity = L.marker([obj['lat'],obj['lng']],{icon: icon}).addTo(map);
            entity.bindPopup(obj['name']);
            entities.push({'marker': entity,'data': obj});
            entity.on('click', function() {
                detailMenuList.innerHTML=createEntityElements({
                    name: obj["name"],
                    info: obj["info"],
                    lat: round(obj["lat"], 3),
                    lng: round(obj["lng"],3),
                    distance: round(obj["distance"],3),
                    id: obj["id"],
                    code: obj["code"],
                    type: tryConvertTypeNameToClient(obj["type"])
                })
            });
        }
    })
}


findButton.onclick = findEntities;

newEntityButton.onclick = function() {
    detailMenuList.innerHTML=createEntityElements({
        name: "My New Airport",
        lat: searchLocationLat.value,
        lng: searchLocationLng.value,
        type: "Small Airport",
        distance: "0",
        id:"100000",
        info:"A new airport.",
        code: "",
    })
}

submitEntityButton.onclick = function () {
    fetch("/submit", {
        method: "PUT",
        body: JSON.stringify({
            message: "hello,",
            id: getInput("id"),
            name: getInput("name"),
            lat: getInput("lat"),
            lng: getInput("lng"),
            type: tryConvertTypeNameToServer(getInput("type")),
            info: getInput("info"),
            code: getInput("code")
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((response) => {
        findEntities();
    });
}
function addEntity() {

}
function evaluateSearchMarkerLocation() {
    let latLng = searchMarker.getLatLng();
    searchLocationLat.value = Math.round(latLng.lat * 1000) / 1000;
    searchLocationLng.value = Math.round(latLng.lng * 1000) / 1000;
    rangeMarker.setLatLng(latLng);
    return latLng;
}

evaluateSearchMarkerLocation();
searchMarker.on('drag',function(){
    evaluateSearchMarkerLocation();
})
function getLocation() {
    let returnPosition = homePosition;
    function positionCallback(position) {
        returnPosition = [position.coords.latitude,position.coords.longitude];
        let zoom = map.getZoom()
        map.setView(returnPosition,13);
        map.setZoom(zoom);
        homePosition = returnPosition;
        locationMarker.setLatLng(returnPosition);
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionCallback);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
    return returnPosition;
}
let weather = "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=2a910f4d08d8f0610e8b071c714d017b"
let view = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
let satellite = 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'

let views = ["Normal","Wind","Satellite"];
let viewIndex = 0;
let alternateLayer
fromId("map-view-button").onclick = function() {
    viewIndex++;
    if (viewIndex === views.length) {viewIndex = 0;}
    fromId("map-view-button-text").innerHTML = views[viewIndex];
    if (alternateLayer) {map.removeLayer(alternateLayer);} alternateLayer = null;
    if (viewIndex === 2) {
        alternateLayer = L.tileLayer(satellite, {
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3'],
        }).addTo(map);
    }
    if (viewIndex === 1) {
        alternateLayer = L.tileLayer(weather, {
            maxZoom: 19
        }).addTo(map);
    }
}

L.tileLayer(view, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://ourairports.com/data/">OurAirports</a>'
}).addTo(map);
getLocation();
fromId("map-home-button").onclick = function() {
    getLocation();
}

findEntities();
rangeMarker.setRadius(Number(searchRange.value)*1000);