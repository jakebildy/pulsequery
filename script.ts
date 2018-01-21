// inits

var popups = [];
var ops = {
	'filters': {
		'twitter': true,
		'yelp': false,
		'facebook': false
	}};


enum Sentiment {
	Positive,
	Negative,
	Neutral,
	Mixed
};

var currentData : any;

$(document).ready(function(){
	/* Create a copy of sidebar menu for desktop */
	$(".toc-copy").html($(".toc").html());
	
	$(".sidebar-toggle.button").click(function() {
		$(".toc.sidebar").sidebar("toggle");
	});

	$(".refresh.button").click(function() {
		console.log("update");
		updateMap();
	});

	$('.ui.checkbox').checkbox('setting', 'onChange', function() {
		var name = $(this).parent()[0].id;
		var category = (name in ['twitter', 'yelp', 'facebook']) ? 'filters' : 'sentiment';
		ops[category][name] = !ops[category][name];
		if(category === 'sentiment') {
			showPopups(currentData);
		}
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
		var text = item.text;

		var options = {
			"encodingType": "UTF8",
			"document": {
				"type": "PLAIN_TEXT",
				"content": text
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
			}
		});
	});

	function addToBuffer(dataToAdd) {
		finished++;

		buffer.push(dataToAdd);

		// complete
		if(finished == data.length) {
			showPopups(buffer);
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

		if(Sentiment[item.sentiment]) {
			var ele = document.createElement("div");
		
			// Debug only
			// console.log(sensor);
			
			// Setup popup menu
			$(ele).addClass("marker");
			$(ele).html("<div class='ui vertical center aligned segment'><i class='male icon'></i></div>");
			$(ele).attr("data-html", 
				"<div class='ui vertical segment'>" + item.text + "</div>"
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

// only call

updateMap();
