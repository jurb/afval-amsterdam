function getURLParameters(key) {
  var params = new URL(document.location).searchParams;
  var name = params.get(key);
  return name;
}

var address = getURLParameters("address");
var coords = getURLParameters("coords");

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
        parseResult(result);
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

    document.getElementById("result-header").innerHTML = naamGrof;
    if (ophaaldag) {
      var ophaaldagArray = ophaaldag.split(",");
      var ophaaldagZin =
        ophaaldagArray.slice(0, ophaaldagArray.length - 1).join(", ") +
        " en " +
        ophaaldagArray.slice(-1);
      document.getElementById("result-huisvuil").innerHTML =
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
      document.getElementById("result-huisvuil").innerHTML =
        "<strong>Huisvuil</strong>: " + aanbiedwijze + ".";
    }
    if (opmerking) {
      document.getElementById(
        "result-huisvuil-opmerking"
      ).innerHTML = opmerking;
    }
    if (ophaaldagGrof == "Op afspraak") {
      document.getElementById("result-grofvuil").innerHTML =
        "<strong>Grofvuil</strong>: <a href='" +
        "https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scGrofvuil.aspx" +
        "'>" +
        ophaaldagGrof +
        "</a>.";
    }
    if (ophaaldagGrof != "Op afspraak") {
      document.getElementById("result-grofvuil").innerHTML =
        "<strong>Grofvuil</strong>: " +
        ophaaldagGrof +
        ", van " +
        tijd_vanafGrof +
        " tot " +
        tijd_totGrof +
        ".";
    }
    if (opmerkingGrof) {
      document.getElementById(
        "result-grofvuil-opmerking"
      ).innerHTML = opmerkingGrof;
    }
  };

  document.getElementById("search-container").className = "is-hidden";
  var coordsArray = coords.split(",");
  var lat = coordsArray[1];
  var lon = coordsArray[0];
  afvalCoordsAPIcall();
}

if (address) {
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
} else {
  var typeaheadAPIcall = function typeaheadAPIcall() {
    var xmlhttp = new XMLHttpRequest();
    var searchcontent = document.getElementById("searchinput").value;
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

  var autocompleteSearchInput = function autocompleteSearchInput(label) {
    document.getElementById("searchinput").value = label;
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
    
    document.getElementById("searchlist").innerHTML = "<br>" + out;
    
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    document.querySelectorAll("#searchlist a").forEach(function(element) {
      element.addEventListener("click", function() {
        document.getElementById("searchinput").value =
          element.attributes.id.textContent + " ";
        document.getElementById("searchinput").focus();
      }); // ends addEventListener
    }); // ends forEach
  }; // ends function

  document
    .getElementById("searchinput")
    .addEventListener("keyup", typeaheadAPIcall);

  if (!navigator.geolocation) {
    document.getElementById("geo-button").className = "is-hidden";
  }
} // ends else
