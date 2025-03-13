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

// Create an empty variable to store the collision GeoJSON data
let collisiongeojson;
// let hexgeojson;

// Use fetch method to access data from URL
fetch('https://raw.githubusercontent.com/huailun-j/GGR472-Lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson')
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
    let bbox = turf.envelope(collisiongeojson); // a bounding box around the collision points using Turf.js
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
    console.log("Bounding Box Coordinates:", bboxcoords); // log the bounding box coordinates

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
    let maxcollis = 0; // create new variable to store max no. of collisions in a hex
    collishex.features.forEach((feature) => { 
        feature.properties.COUNT = feature.properties.values.length //count the number of collisions
        if (feature.properties.COUNT > maxcollis) { //if the COUNT value is bigger than the maxcollis collision value
            console.log(feature); 
            maxcollis = feature.properties.COUNT // to updates the maximum collision value 
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

    // for hexgrid data as source, add a fill layer for the hexgrid

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
                ['get', 'COUNT'], //get COUNT property
                '#EBDFDF', //color
                5, '#FF8080',
                15, '#FF4D4D',
                25, '#E60000'
            ],
            'fill-opacity': 0.75, //set opacity
            'fill-outline-color': "#B8AEAE"
        }
    });

    // for collision points
    map.addSource('collision', {
        type: 'geojson',
        data: collisiongeojson
    });

    map.addLayer({
        'id': 'collisionpoints',
        'type': 'circle',
        'source': 'collision',
        'paint': {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 7.2, // Zoom level 10: 8px
                12, 6 // Zoom level 12:6px
            ],
            'circle-radius': 3,
            'circle-color': '#4b3f3f',
            'circle-stroke-width': 0.4,
            'circle-stroke-color': 'white'
        }
    });
    
    // Pop-up windows that appear on a mouse click or hover, remove layer
    //pop up, collision. When mouse click, can see the collision info. Changing cursor on mouse over.
    map.on('mouseenter', 'collisionpoints', () => {
        map.getCanvas().style.cursor = 'pointer'; 
    });
    
     // Changing cursor when mouse leave
    map.on('mouseleave', 'collisionpoints', () => {
        map.getCanvas().style.cursor = ''; 
    });

    // Event listener for showing popup on click, here is collision points data
    map.on('click', 'collisionpoints', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
            .setHTML(
                `<b>Year:</b> ${e.features[0].properties.YEAR}<br>
                 <b>Neighbourhood:</b> ${e.features[0].properties.NEIGHBOURHOOD_158}<br>
                 <b>Type:</b> ${e.features[0].properties.INVTYPE}<br>
                 <b>Injury:</b> ${e.features[0].properties.Injury}`
            )
            .addTo(map); //Show popup on map
    });


 //legend
    // create legend here
    //Define array variables for labels and colors.
    const legendLabels = [
        '0-5',
        '6-15',
        '16-25',
        '>25'
        
    ];
    //legend hex color
    const legendColors = [
        '#EBDFDF',
        '#FF8080',
        '#FF4D4D',
        '#E60000'
    ];

    const legend = document.getElementById('legend'); // Get the legend container

    // to create a container for the collision point count legend
    const collisionCountContainer = document.createElement('div'); // 创建一个容器存放碰撞数量的图例
    legendLabels.forEach((label, i) => {
        const item = document.createElement('div'); // create a legend item
        const key = document.createElement('span'); // create color key
        key.className = 'legend-key';
        key.style.backgroundColor = legendColors[i]; //set the color

        const value = document.createElement('span'); //create label
        value.innerHTML = `${label}`; //label text

        item.appendChild(key);
        item.appendChild(value);
        collisionCountContainer.appendChild(item); // to add item to the container
    });


    // add the collision count legend to the map, this step asked chatgpt for debug, my collision points legend title duplicated at first
    const collisionCountTitle = legend.querySelector('h4'); //first legend title (hex)
    legend.insertBefore(collisionCountContainer, collisionCountTitle.nextSibling); // insert the legend after the title
    // a container for the collision points legend
    const legendCollisionPoints = document.createElement('div');
    const pointItem = document.createElement('div');
    const pointKey = document.createElement('span');
    pointKey.className = 'legend-key';
    pointKey.style.backgroundColor = '#4b3f3f'; // color
    pointKey.style.borderRadius = '50%'; // radium
    pointKey.style.width = '10px';
    pointKey.style.height = '10px';

    const pointValue = document.createElement('span');
    pointValue.innerHTML = 'Collision point'; //text on 

    pointItem.appendChild(pointKey);
    pointItem.appendChild(pointValue);
    legendCollisionPoints.appendChild(pointItem);

    // to add collision points legend to the webmap
    const collisionPointsTitle = legend.querySelectorAll('h4')[1]; // add second legend title
    legend.insertBefore(legendCollisionPoints, collisionPointsTitle.nextSibling); // insert legend after title


    // Add event listener to toggle the visibility of hexbin and collision layers
    //For Hexbin
    document.getElementById('hexcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'collis-hex-fill',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    //for legend
    document.getElementById('legendcheck').addEventListener('change', (e) => {
        document.getElementById('legend').style.display = e.target.checked ? 'block' : 'none';
    });

});






