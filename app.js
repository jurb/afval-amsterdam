// First we get the URL parameters
function getURLParameters(key) {
  var params = new URL(document.location).searchParams;
  var name = params.get(key);
  return name;
}

var address = getURLParameters("address");
var coords = getURLParameters("coords");

// Bind html element ids to variables
var searchContainer = document.getElementById("search-container");
var resultHuisvuil = document.getElementById("result-huisvuil");
var resultHuisvuilOpmerking = document.getElementById("result-huisvuil-opmerking");
var resultGrofvuil = document.getElementById("result-grofvuil");
var resultGrofvuilOpmerking = document.getElementById("result-grofvuil-opmerking");
var resultHeader = document.getElementById("result-header");
var searchInput = document.getElementById("searchinput");
var searchList = document.getElementById("searchlist");
var geoButton = document.getElementById("geo-button");
var searchStatusText = document.getElementById("search-status-text");

////////////////////////////////////////////////////
// If coords are in URL: show trash rules via API //
////////////////////////////////////////////////////

if (coords) {
  var afvalCoordsAPIcall = function afvalCoordsAPIcall() {
    var xmlhttp = new XMLHttpRequest();
    var searchurl =
      "https://api.data.amsterdam.nl/afvalophaalgebieden/search/?lat=" +
      lat +
      "&lon=" +
      lon;
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        if (result.result.features.length == 0) {
          resultHeader.innerHTML =
            "Deze locatie ligt niet in Amsterdam";
        } else {
          console.log(result.result.features)
          parseResult(result);
        }
      }
    };
    xmlhttp.open("GET", searchurl, true);
    xmlhttp.send();
  };

  var parseResult = function parseResult(obj) {
    var aanbiedwijze = obj.result.features[0].properties.aanbiedwijze;
    var ophaaldag = obj.result.features[0].properties.ophaaldag;
    var tijd_vanaf = obj.result.features[0].properties.tijd_vanaf;
    var tijd_tot = obj.result.features[0].properties.tijd_tot;
    var opmerking = obj.result.features[0].properties.opmerking;
    var naamGrof = obj.result.features[1].properties.naam;
    var ophaaldagGrof = obj.result.features[1].properties.ophaaldag;
    var tijd_vanafGrof = obj.result.features[1].properties.tijd_vanaf;
    var tijd_totGrof = obj.result.features[1].properties.tijd_tot;
    var websiteGrof = obj.result.features[1].properties.website;
    var opmerkingGrof = obj.result.features[1].properties.opmerking;

    resultHeader.innerHTML = naamGrof;

    if (ophaaldag) {
      var ophaaldagArray = ophaaldag.split(",");
      var ophaaldagZin =
        ophaaldagArray.slice(0, ophaaldagArray.length - 1).join(", ") +
        " en " +
        ophaaldagArray.slice(-1);
      resultHuisvuil.innerHTML =
        "<strong>Huisvuil</strong>: " +
        aanbiedwijze +
        ", op " +
        ophaaldagZin +
        ", van " +
        tijd_vanaf +
        " tot " +
        tijd_tot +
        ".";
    }
    if (!ophaaldag) {
      resultHuisvuil.innerHTML =
        "<strong>Huisvuil</strong>: " + aanbiedwijze + ".";
    }
    if (opmerking) {
      resultHuisvuilOpmerking.innerHTML = opmerking;
    }
    if (ophaaldagGrof == "Op afspraak") {
      resultGrofvuil.innerHTML =
        "<strong>Grofvuil</strong>: <a href='" +
        "https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scGrofvuil.aspx" +
        "'>" +
        ophaaldagGrof +
        "</a>.";
    }
    if (ophaaldagGrof == "Geen inzamelingsdagen") {
      resultGrofvuil.innerHTML =
        "<strong>Grofvuil</strong>: Geen inzamelingsdagen.";
    } 
    else {
      resultGrofvuil.innerHTML =
        "<strong>Grofvuil</strong>: " +
        ophaaldagGrof +
        ", van " +
        tijd_vanafGrof +
        " tot " +
        tijd_totGrof +
        ".";
    }
    if (opmerkingGrof) {
      resultGrofvuilOpmerking.innerHTML = opmerkingGrof;
    }
  };

  var coordsArray = coords.split(",");
  var lat = coordsArray[1];
  var lon = coordsArray[0];
  afvalCoordsAPIcall();
  searchContainer.className = "is-hidden";
}

////////////////////////////////////////////////////////////////////////
// If address is in URL: get coordinates via API and put those in URL //
////////////////////////////////////////////////////////////////////////

if (address) {
  searchContainer.className = "is-hidden";

  var addressSearchAPIcall = function addressSearchAPIcall() {
    var xmlhttp = new XMLHttpRequest();
    var searchurl =
      "https://api.data.amsterdam.nl/atlas/search/adres/?format=json&q=" +
      address;
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        parseAddressResult(result);
      }
    };
    xmlhttp.open("GET", searchurl, true);
    xmlhttp.send();
  };

  var parseAddressResult = function parseAddressResult(obj) {
    var centroid = obj.results[0].centroid;
    window.location = "?coords=" + centroid;
  };

  addressSearchAPIcall();
}

/////////////////////////////////////////////////////////
// If no parameters in URL, show address and geo input //
/////////////////////////////////////////////////////////
else {
  var typeaheadAPIcall = function typeaheadAPIcall() {
    var xmlhttp = new XMLHttpRequest();
    var searchcontent = searchInput.value;
    var searchurl =
      "https://api.data.amsterdam.nl/atlas/typeahead/bag/?format=json&q=" +
      searchcontent;
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var resultArray = JSON.parse(this.responseText);
        displayTypeahead(resultArray);
      }
    };
    xmlhttp.open("GET", searchurl, true);
    xmlhttp.send();
  };

  var displayTypeahead = function displayTypeahead(arr) {
    var out = "";
    var i = void 0;
    if (arr.length != 0) {
      for (i = 0; i < arr[0].content.length; i++) {
        var label = arr[0].content[i]._display;
        if (!arr[0].content[0].uri.includes("bag/openbareruimte")) {
          out += '<a href="?address=' + label + '">' + label + "</a><br>";
        } else {
          out += '<a href="#" id="' + label + '">' + label + " ...</a><br>";
        }
      }
    }
    searchList.innerHTML = "<br>" + out;

    // add searchlist click listeners
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function(callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }
    document.querySelectorAll("#searchlist a").forEach(function(element) {
      element.addEventListener("click", function() {
        searchInput.value =
          element.attributes.id.textContent + " ";
          searchInput.focus();
      });
    });
  };

  searchInput
    .addEventListener("keyup", typeaheadAPIcall);

  // Geo button stuff
  if (!navigator.geolocation) {
    geoButton.className = "is-hidden";
  }

  var geoFindMe = function geoFindMe() {
    function success(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      window.location = "?coords=" + lon + "," + lat;
    }

    var error = function error() {
      
      searchStatusText.innerHTML =
        "Het is niet gelukt om jouw locatie te vinden";
    };
    searchStatusText.innerHTML =
      "Bezig met locatie vinden...";
    navigator.geolocation.getCurrentPosition(success, error);
  };
} // ends else
