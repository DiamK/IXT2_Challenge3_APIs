// API tokens
mapboxgl.accessToken = 'pk.eyJ1IjoiZGlhbWsiLCJhIjoiY2wxMmZrdWt6MDZmcjNqbXZ5dWFxanVqaiJ9.jETzazuYjwW3lYPbiy2wTA';
const openWeatherMapApiKey = "6b7fcee3433990325c747b6d1a0b23f0";

// Maken van de map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [5.670294, 52.265624],
    zoom: 4
});

// plaats marker on map click event
map.on('click', addMarker);

// Creeër een markerobject
var marker = new mapboxgl.Marker();

// Functie om locatie van de marker te krijgen en de html en css daarbij aan te passen
function addMarker(event) {
    var coordinates = event.lngLat;
    marker.setLngLat(coordinates).addTo(map);
    document.getElementById("selectedLocation").style.display = "flex";
    document.getElementById("weatherContainer").style.display = "flex";
    document.getElementById("nearestBreweriesContainer").style.display = "flex";
    document.getElementById("instructions").style.display = "none";
    updatePlacenameFromCoordinates(coordinates.lng, coordinates.lat);
    updateCurrentWeatherFromCoordinates(coordinates.lng, coordinates.lat);
    updateNearestBreweriesByCoordinates(coordinates.lng, coordinates.lat);
}

// Functie om de coördinaten van de marker om te zetten in een locatienaam
function updatePlacenameFromCoordinates(lng, lat) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                var json = JSON.parse(xmlhttp.responseText);
                document.getElementById("selectedLocation").innerText = "Locatie:" + " " + json["features"][0]["place_name"]; // schrijft locatienaam in de website
            } else {
                alert('er ging iets mis bij het laden van de API');
            }
        }
    };

    url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?access_token=" + mapboxgl.accessToken;

    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

// Functie om het weer API te callen en weersinformatie weer te geven op de pagina
function updateCurrentWeatherFromCoordinates(lng, lat) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                var json = JSON.parse(xmlhttp.responseText);
                document.getElementById("weatherDescription").innerText = json["weather"][0]["description"];
                document.getElementById("weatherTemp").innerText = json["main"]["temp"];
                document.getElementById("weatherPressure").innerText = json["main"]["pressure"];
                document.getElementById("weatherHumidity").innerText = json["main"]["humidity"];
                document.getElementById("weatherVisibility").innerText = json["visibility"];
                document.getElementById("weatherWindspeed").innerText = json["wind"]["speed"];
            } else {
                alert('er ging iets mis bij het laden van de API');
            }
        }
    };

    url = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" + lat + "&lon=" + lng + "&appid=" + openWeatherMapApiKey;

    xmlhttp.open("GET", url, false);
    xmlhttp.send();


}

// Functie om de 5 dichtsbijzijnde brouwerijen op te halen en ze op de pagina weer te geven
function updateNearestBreweriesByCoordinates(lng, lat) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                var json = JSON.parse(xmlhttp.responseText);
                let breweryList = document.getElementById("nearestBreweries");
                breweryList.innerHTML = "";
                for (let i = 0; i < json.length && i < 5; i++) {
                    calculatedDistance = Math.trunc(calcDistanceBetweenCoordsInKm(lat, lng, json[i]["latitude"], json[i]["longitude"])); // Math.trunc rond afstand af
                    breweryList.innerHTML = breweryList.innerHTML + "<li>" + json[i]["name"] + " - " + calculatedDistance + " km</li>";
                }
            } else {
                alert('er ging iets mis bij het laden van de API');
            }
        }
    };

    url = "https://api.openbrewerydb.org/breweries?by_dist=" + lat + "," + lng;

    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

// Functie om afstand te berekenen. Source = https://stackoverflow.com/a/18883819
function calcDistanceBetweenCoordsInKm(lat1, lng1, lat2, lng2) {

    function toRad(value) {
        return value * Math.PI / 180;
    }

    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}