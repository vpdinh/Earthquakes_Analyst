//This project will program with manually ways - Circle marker and polyline instead of using "black-box" GEOJSON, which we will inherit functions but do not know how it work 
// on data was formatted for GEOJSON.

//US coordinate
var USCoords = [38, -97];
  
  // Create 2 layers Earthquake & Faults, will fetch datas,add to overlay map 
  var earthquake = new L.layerGroup();
  var faults = new L.layerGroup();


// create 3 tite layers to view map from 3 diff aspects
  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });
  var satellite= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscales = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  //Create map and set tile layer default (Outdoors) to map
  var myMap = L.map("map-id", {
    center: USCoords,
    zoom: 5,
    layers: [outdoors]
  });

//Add tile layers to base map
  var baseMaps = {
    "Satellite": satellite,
    "Grayscales": grayscales,
    "Outdoors": outdoors
  };
 
// Read Earthquake datas and fetching data according Coordinates of earthquake using manually way,CircleMarker not using Geojson

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", function(response) {
   
   let data = response.features;
    console.log(data)
   
    let locationmarkers = [];
    let largestearthquake=0;
    let largestinfo = "";
  
    for(let index = 0; index < data.length; index++){
        
    //console.log(data[index].geometry.coordinates);
    // console.log(data[index].properties.title);
      let location = data[index].geometry.coordinates;
      let info = data[index].properties;
      let mag =  data[index].properties.mag;
      //Calculate by converting time to date occured earthquake
      var date = new Date(info.time);

      if (largestearthquake <=mag) {
          largestearthquake =mag;
          largestinfo="<h3>" + "Current strongest earthquake: &nbsp" + date.toString().slice(0,34) + " <br>" + info.title + "<br>" + "Tsunamis:" + info.tsunami + "</h3>";
      }
      


      //calculate Magnitude to display marker( in this case using circle marker to display on Map)
    L.circleMarker(new L.LatLng(location[1], location[0]), {
        radius: mag*5,
        color: "black",
        fillColor: getcolor(mag)[0],
        weight:0.8,
        stroke: true,
        opacity:0.9,
        fillOpacity: 1
    })
    //add to overlay - earthquake Layer
       .bindPopup("<h3>" + "Information: &nbsp" + date.toString().slice(0,34) + " &nbsp - &nbsp" + info.title + "<br>" + "Tsunamis:" + info.tsunami + "</h3>")
    //locationmarkers.push(locationmarker);
     .addTo(earthquake);
    }

    var largestonmap = L.control({position: 'bottomleft'});
    var div = L.DomUtil.create('div', 'alert');
    largestonmap.onAdd = function () { div.innerHTML = div.innerHTML + `<i style="background:${largestearthquake}">
            </i>${largestinfo} <br>`;
            return div;
  }
    largestonmap.addTo(myMap);
    // myMap.addLayer(earthquake);
   
    //add to map
  earthquake.addTo(myMap);
});

    //Doing a funtion call getcolor which will use for earthquake and legend to generate the same color scales for each degree of magnitude
function getcolor(mag){

    if (mag <=1) {
     return ["rgb(169, 235, 104)","0-1"];
    }
    else if (mag<=2) {
     return ["rgb(241, 243, 104)","1-2"];
    }
    else if  (mag <=3){
     return ["rgb(243, 213, 77)","2-3"];
    }
    else if  (mag <=4){
        return ["rgb(230, 164, 90)","3-4"];
    }
    else if  (mag <=5){
        return ["rgb(243, 114, 9)","4-5"];
    }
    else {
        return ["rgb(236, 48, 24)","5+"];
    }
}


   // create the legend's innerHTML with degree of magnitude
function Legend(map) {
    var info = L.control({position: 'bottomright'});
    info.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend');
        scales = [0, 1, 2, 3, 4, 5];
        div.innerHTML = "<div>" + "Magnitude" + "</div>";
        for (var i = 0; i < scales.length; i++) {
            div.innerHTML = div.innerHTML + `<i style="background:${getcolor(scales[i] + 1)[0]}">
            </i>${getcolor(scales[i] + 1)[1]} <br>`;
        }
        return div;
    };
    info.addTo(map);
}

   //Data on tectonic plates
   // Read Tectonic Plate and its fault datas and fetching data according Coordinates of faults using manually way,Polyline not using Geojson


d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(response) {
   
   // console.log(response)
    let datafault = response.features;
   
    let lines = [];
    console.log(datafault);
    for(let index = 0; index < datafault.length; index++){
        
      let line = datafault[index].geometry.coordinates;

          for(let i = 0; i < line.length; i++)
          {
            lines.push(new L.LatLng(line[i][1], line[i][0]));
          }
          //Coz Faults are found by many scientist and from other years so we have to add to map after getting from a scientist to elimate redundant line will draw between each other
          L.polyline(lines, {
            color: 'red',
            weight: 1,
            opacity: 1,
            smoothFactor: 1
            }).addTo(faults);
            lines=[];
    }
   
 //myMap.addLayer(faults);

faults.addTo(myMap);
});
 //add Legend to map
Legend(myMap);

 //Creat Overlay map and add 2 layers 
var overlay = {
  "Earthquakes": earthquake,
  "Faults": faults
};

 //add basemap and overlay map to L.control.layers
L.control.layers(baseMaps, overlay).addTo(myMap); 
