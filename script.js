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

	$('.apply-changes').click(function() {
		updateMap();
	});

	$('.ui.checkbox').checkbox('setting', 'onChange', function() {
		ops.filters[$(this).parent()[0].id] = !ops.filters[$(this).parent()[0].id];
		updateMap();
	});
});

function updateMap() {
	$.ajax({
		type: "POST",
		url: "http://localhost:5000/data", // NOTE: url of the request
		dataType: 'json',
		data: ops,
		success: function(data) {
			console.log(data); // NOTE: do something with the data
		}
	});
}

// show popup

function showPopups(ops, data) {
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

showPopups(ops, [
	{
		"text": "Hello world!",
		"location": [-118.276690, 34.031057],
		"time": 12345,
		"provider": "twitter"
	}
]);