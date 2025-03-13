# GGR472-Lab4
## 🚦 Traffic Collisions in Toronto（2006-2021）

### 🌟 Project Overview
The webmap visualizes traffic accidents involving pedestrians and cyclists in the city of Toronto from 2006 to 2021. Using Turf.js and Mapbox, the project generates an interactive hexagonal grid map with collision points to visually show the density of accidents and help the public understand accident-prone areas.

### 🌍 Purpose
The aim of this project is to create a dynamic webmap visualization tool to help users understand Toronto's traffic accident patterns. The webmap can be used by urban planners, policymakers and the public to improve road safety.
Users can analyze the map to find:
- Areas with high accident rates, especially locations with higher risks for pedestrians and cyclists.
- Trends in accident distribution, to observe the accident situation in different years or regions.
- Possible safety improvement measures to provide data support for urban planning.

### 📁 Project Structure
1. index.html: Main file for structuring the webpage, including the navigation bar, search box, map container and legend.
2. script.js: JavaScript file for for data acquisition, map initialization, layer creation, pop-ups and interactive functions.
3. style.css: Custom CSS for styling the webpage and map layout, legend, map search.
4. Data/: Contains the GeoJSON dataset pedcyc_collision_06-21.geojson, which stores traffic accident records.
 
### 📊 Data Sources
One data for this webpage was sourced from Toronto's Open Data Portal:
Point Feature: [Collision] (https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/)
