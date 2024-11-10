
const locations = JSON.parse(document.getElementById('map').dataset.locations);
 console.log(locations);
 
mapboxgl.accessToken = 'pk.eyJ1IjoibHVraG8tNyIsImEiOiJjbTNjMHN6aGYwZnhqMm1zNmd6eWIxY3dvIn0.w8BGrJ5vmNl__cPQAGb4gg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11'
});
  
