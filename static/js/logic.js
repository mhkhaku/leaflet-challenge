//Module 15 Challenge (Leaflet- Challenge
//-------------------------------------------

// Store our API endpoint as query1 and tectonic plate data as "tectonic_plates".
var query1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonic_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// 1. Create the earthquake vizualization
// --------------------------------------------------------------------------------

// Perform a GET request to the query URL
d3.json(query1).then(function (data) {
  // Send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Create function to determine marker size
function markerSize(mag) {
  // Increase the size of the magnitude marker to make it more readable
  return mag * 10000;
};

// Function to define marker color by magnitude
function MarkerColour(d) {
    return d <=10 ? '#ADFF2F' :
           d <=30 ? '#9ACD32' :
           d <=50 ? '#FFFF00' :
           d <=70 ? '#ffd700' :
           d <=90 ? '#FFA500' :
                    '#FF0000';
}

// Function to create earthquake map (the basis of our map)
function createFeatures(EarthQuakeData) {

  // Define a function that we want to run once for each feature in the GEOJSON file.
  
  function onEachFeature(feature, layer) {

    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(EarthQuakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function(feature, latlng) {

      // Determine the style of markers based on earthquake magnitude
      // https://leafletjs.com/reference.html#circlemarker
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: MarkerColour(feature.geometry.coordinates[2]),
        fillOpacity: 0.4,
        color: "black",
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlng,markers);
    }
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Create the base map & overlay maps
function createMap(earthquakes) {

  // Create tile layer using MapBox and OpenStreet Map (as shown in the attribute of the sample image)
  // Grayscale base map
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style:'mapbox/light-v11',
    access_token: 'pk.eyJ1IjoibWljaGVsbGVjYXJ2YWxobyIsImEiOiJjbGUwbXBxYzMxY3RzM3ZueTN6ZnRicGJxIn0.rtETj8AmHXnbIsQ-RguXFA'
  });

  // Satellite base map
  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:'mapbox/satellite-streets-v12',
    access_token: 'pk.eyJ1IjoibWljaGVsbGVjYXJ2YWxobyIsImEiOiJjbGUwbXBxYzMxY3RzM3ZueTN6ZnRicGJxIn0.rtETj8AmHXnbIsQ-RguXFA'
  });

  // Outdoors base map
  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:'mapbox/outdoors-v12',
    access_token: 'pk.eyJ1IjoibWljaGVsbGVjYXJ2YWxobyIsImEiOiJjbGUwbXBxYzMxY3RzM3ZueTN6ZnRicGJxIn0.rtETj8AmHXnbIsQ-RguXFA'
  });

  // 2. Add tectonic plate data to our earthquake visualization
  // --------------------------------------------------------------------------------
  
  // Create a new layer on our map to show the earth's tectonic plates relative to earthquake activity
  faultlines = new L.layerGroup();

  // Perform a GET request to the tectonicplates JSON data set
  d3.json(tectonic_plates).then(function (plates) {

      // Format and add the faultlines layer to our map 
      L.geoJSON(plates, {
          color: "red",
          weight: 2
      }).addTo(faultlines);
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Grayscale": grayscale,
    "Satellite": satellite,
    "Outdoors": outdoors
  };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": faultlines
    };  

  // Create our map, specifying the layers to display
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [earthquakes, grayscale, satellite, outdoors, faultlines]
  });


// Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [-10, 10, 30, 50, 70, 90],
    labels = ['<strong>Magnitude</strong>'];

    div.innerHTML+='Magnitude<br><hr>'

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + MarkerColour(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

  // Adds Legend to myMap

  legend.addTo(myMap)

  // Create the layer toggle control

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

};