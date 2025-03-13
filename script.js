/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhaWx1biIsImEiOiJjbTVvOTJvNzAwZnJrMmtwdGpkMzRvdmk1In0.TnWy4ZzmPCKAX1aYKDWMaQ'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/huailun/cm86b4g8c00dq01qv8lw69w5h',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});


// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca" //Canada only
});

// Append geocoder variable to goeocoder HTML div to position on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({ center: [-79.39, 43.73], zoom: 10 });
});


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable

let collisiongeojson;
// Use fetch method to access data from URL
fetch('https:///huailun-j.github.io/GGR472-Lab4/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        collisiongeojson = response; // Store geojson as variable using URL from fetch response
    });


/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here

map.on('load', () => {
    console.log("Collision data loaded:", collisiongeojson);

    let bboxgeojson;
    let bbox = turf.envelope(collisiongeojson); 
    let bboxscaled = turf.transformScale(bbox, 1.10); //increasing the size of the bounding box by 10%
    console.log("Expanded Bounding Box:", bboxscaled);

    // create empty geojson objects to hold feature
    bboxgeojson = {
        "type": "FeatureCollection",
        "feature": [bboxscaled]

    }
    
    // get the min and max coordinates of both axis the bounding box. Store as array of coordinates [minX, minY, maxX, maxY]
    let bboxcoords = [
        bboxscaled.geometry.coordinates[0][0][0], // minX
        bboxscaled.geometry.coordinates[0][0][1], // minY
        bboxscaled.geometry.coordinates[0][2][0], // maxX
        bboxscaled.geometry.coordinates[0][2][1]  // maxY
    ];
    console.log("Bounding Box Coordinates:", bboxcoords);

    // Create a grid of 0.5km hexagons inside the spatial limits of the bbox coordinates
    let hexgeojson = turf.hexGrid(bboxcoords, 0.5, { units: "kilometers"});

    
/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty

    // aggregate the point data
    let collishex = turf.collect(hexgeojson, collisiongeojson, '_id', 'values');
    //create a foreach loop
    let maxcollis = 0; // create new variable to storemax no. collisions
    collishex.features.forEach((feature) => { 
        feature.properties.COUNT = feature.properties.values.length //count the number of collisions
        if (feature.properties.COUNT > maxcollis) { //if the COUNT value is bigger than the maxcollis collision value
            console.log(feature); 
            maxcollis = feature.properties.COUNT // to updates the maxcollision value 
        }
    });


    //5

    map.addSource('collis-hex', {
        type: 'geojson',
        data: hexgeojson
    });

    map.addLayer({
        'id': 'collis-hex-fill',
        'type': 'fill',
        'source': 'collis-hex',
        'paint': {
            'fill-color': [
                'step', //step expression
                ['get', 'COUNT'],
                '#F9E79F',
                10, '#F39C12',
                25, '#D35400'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': "white"
        }
    });



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


