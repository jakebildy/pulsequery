// inits

var popups = [];
var ops = {
	'filters': {
		'twitter': true,
		'yelp': false,
		'facebook': false
	},
	'sentiment': {
		'positive': true,
		'negative': true,
		'neutral': true,
		'mixed': true
	}
};
var currentData = null;

const latRadius = 0.06;
const lonRadius = 0.1;

$(document).ready(function(){
	/* Create a copy of sidebar menu for desktop */
	$(".toc-copy").html($(".toc").html());
	
	$(".sidebar-toggle.button").click(function() {
		$(".toc.sidebar").sidebar("toggle");
	});

	$(".refresh.button").click(function() {
		updateMap();
	});

	$('.ui.checkbox').checkbox('setting', 'onChange', function() {
		var name = $(this).parent()[0].id;
		var category = (['twitter', 'yelp', 'facebook'].indexOf(name) != -1) ? 'filters' : 'sentiment';
		ops[category][name] = !ops[category][name];
		showPopups(currentData);
	});
});

function updateMap() {
	showPopups([]);
	$('.ui.dimmer').dimmer('show');
	$('.refresh.button').addClass('disabled');
	$('.refresh.button').html('Updating Display...');

	let options = {
		"filters": ops.filters,
		"latitude": map.getBounds().getCenter().lat,
		"longitude": map.getBounds().getCenter().lng,
		"radius": 20000
	};

	console.log(options);

	$.post( "https://pulsequery-sbhacks.firebaseapp.com/data", options)
		.done(function( data ) {
			console.log(data);
			processSentimentsAndShowData(data);
		});
}

function processSentimentsAndShowData(data) {
	var buffer = [];
	var finished = 0;

	data.forEach((item) => {
		if(item.provider === 'twitter') {
			var latitude = map.getBounds().getCenter().lat;
			var longitude = map.getBounds().getCenter().lng;
			var calculatedLat = latitude + Math.random() * latRadius - latRadius / 2;
			var calculatedLon = longitude + Math.random() * lonRadius - lonRadius / 2;
			item.location = [calculatedLon, calculatedLat];
		}

		var text = item.text;
		var processedText = text.replace(/[^\w\s]/gi, '');

		var options = {
			"encodingType": "UTF8",
			"document": {
				"type": "PLAIN_TEXT",
				"content": processedText
			}
		};

		$.ajax({
			type: 'POST',
			url: 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyD2mHSjK-n0dojIqhnHRGQ6_XxAtJxtLTg',
			// crossDomain: true,
			data: JSON.stringify(options),
			contentType: 'application/json',
			success: function(sentimentData, textStatus, jqXHR) {
		    	let magnitude = sentimentData.documentSentiment.magnitude;
				let score = sentimentData.documentSentiment.score;

				var sentiment = '';
				if(score > 0.4) {
					sentiment = 'positive';
				}
				else if(score < -0.4) {
					sentiment = 'negative';
				}
				else if(magnitude > 2.0) {
					sentiment = 'mixed';
				}
				else {
					sentiment = 'neutral';
				}

				item.sentiment = sentiment;
				addToBuffer(item);
			},
			error: function (responseData, textStatus, errorThrown) {
		    	console.log("failed");
		    	addToBuffer(null);
			}
		});
	});

	function addToBuffer(dataToAdd) {
		finished++;

		if(dataToAdd != null) {
			buffer.push(dataToAdd);
		}

		// complete
		if(finished == data.length) {
			showPopups(buffer);

			$('.ui.dimmer').dimmer('hide');
			$('.refresh.button').html('Map View Updated');
		}
	}
}

// show popup

function showPopups(data) {
	currentData = data;
	popups.forEach(item => item.remove());
	popups = [];

	Object.keys(data).forEach(function(key) {
		var item = data[key];
		// console.log(item.provider + " " + ops.filters[item.provider]);

		if(ops.sentiment[item.sentiment] && ops.filters[item.provider]) {
			var ele = document.createElement("div");
		
			// Debug only
			// console.log(sensor);
			
			// Setup popup menu
			$(ele).addClass("marker");
			$(ele).html("<div class='ui vertical center aligned segment'><i class='male icon'></i></div>");
			$(ele).attr("data-html", 
				"<div class='ui vertical segment with-divider'>" + item.text + "</div>"
				+ "<div class='ui vertical right aligned segment'><i class='thumbs outline down icon'></i><i class='thumbs outline up icon'></i></div>"
			);
			$(ele).attr("data-variation", "tiny");
			$(ele).attr("data-position", "top center");
			$(ele).popup({
				"on": "click"
			});

			new mapboxgl.Marker(ele) //, {offset: [0, 0]})
				.setLngLat(item.location)
				.addTo(map);

			popups.push(ele);
		}
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
map.on('load', function() {
	map.on('movestart', function(e) {
		$('.refresh.button').removeClass('disabled');
		$('.refresh.button').html('Update Display in Current Map View');
	});
});

// only call

updateMap();