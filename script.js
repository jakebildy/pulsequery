// inits

var popups = [];
var ops = {
	'filters': {
		'twitter': true,
		'yelp': false,
		'facebook': false
	}
};

$(document).ready(function(){
	/* Create a copy of sidebar menu for desktop */
	$(".toc-copy").html($(".toc").html());
	
	$(".sidebar-toggle.button").click(function() {
		$(".toc.sidebar").sidebar("toggle");
	});

	$('.ui.checkbox').checkbox('setting', 'onChange', function() {
		ops.filters[$(this).parent()[0].id] = !ops.filters[$(this).parent()[0].id];
		updateMap();
	});
});

function updateMap() {
	showPopups([]);

	let options = {
		"filters": ops.filters,
		"latitude": map.getBounds().getCenter().lat,
		"longitude": map.getBounds().getCenter().lng,
		"radius": 20000
	};

	$.ajax({
		type: "POST",
		url: "https://pulsequery-sbhacks.firebaseapp.com/data",
		dataType: 'json',
		contentType: "application/json",
		processData: false,
		data: JSON.stringify(options),
		success: function(data) {
			console.log(data);
			showPopups(data);
		}
	});
}

// show popup

function showPopups(data) {
	popups.forEach(item => item.remove());
	popups = [];

	Object.keys(data).forEach(function(key) {
		var item = data[key];

		var popup = new mapboxgl.Popup({closeOnClick: false})
		    .setLngLat([-118.276690, 34.031057])
		    .setHTML('<div>' + item.text + '</div>')
		    .addTo(map);

		popups.push(popup);
	});
}

// extensions for UI

jQuery.fn.extend({
	showNoData: function() {
		$(this).html(
			"<p style='color: gray; text-align: center; line-height: " + ($(this).width() * 0.5) + "px;'>No Data</p>"
		);
	}
});

// Map

mapboxgl.accessToken = 'pk.eyJ1IjoicHZ4eWllIiwiYSI6ImNqNDUwbndteTF1NWozMnJ1bjA2a2xrOWoifQ.Dkr7hVK4a9hpq6ReN66ZsA';
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
	center: [-118.276690, 34.031057], // starting position
	zoom: 13 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

// only call

updateMap();