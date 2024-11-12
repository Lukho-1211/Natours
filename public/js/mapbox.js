
const locations = JSON.parse(document.getElementById('map').dataset.locations);
 console.log(locations);
 
mapboxgl.accessToken = 'pk.eyJ1IjoibHVraG8tNyIsImEiOiJjbTNjMHN6aGYwZnhqMm1zNmd6eWIxY3dvIn0.w8BGrJ5vmNl__cPQAGb4gg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  scrollZoom: false
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
});
  

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Marker create
  const el = document.createElement('div');
  el.className = 'marker';
 
  //Add Marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
  .setLngLat(loc.coordinates)
  .addTo(map);

  // Add pop informaton
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds,{
  padding:{
    top:200,
    bottom:150,
    left: 100,
    right: 100
  }
}
  
);