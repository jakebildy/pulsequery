import * as functions from 'firebase-functions';
var Twitter = require('twitter');
var request = require('request');
const cors = require('cors')({origin: true});

var client = new Twitter({
	consumer_key: 'LtLevHN6XaKe5bqNsIcDMz9U1',
	consumer_secret: 'mLKUqtNCtzMRq2cg5FiXREsq4fY3V7JtYHZ0i6vMU8Cm18LPEH',
	access_token_key: '954669190098534400-02eLwaJpxl4kUqn4wk9I5wBms0LjWV0',
	access_token_secret: 'vwF7XsyA4AhI4fHINXPJixrdRopLRUXP45vPCA8EYOJj0'
});

// this is a cloud function named "getData". You can call it using BASE_URL + '/data'.
// this is set up in firebase.json
exports.getData = functions.https.onRequest((req, res) => {
	cors(req, res, () => {
		var filters = req.body.filters;
		var latitude: number = req.body.latitude;
		var longitude: number = req.body.longitude;
		var radius: number = req.body.radius;

		var completed = 0;
		var numProviders = 2;
		var resultAggregater = [];

		numProviders = (filters.yelp ? 1 : 0) + (filters.twitter ? 1 : 0);

		if(filters.yelp) {
			console.log("starting yelp...");
			getYelpReviews(res, latitude, longitude, radius);
		}

		if(filters.twitter) {
			console.log("starting twitter...");
			getTwitterPosts(res, latitude, longitude, radius);
		}

		if(numProviders == 0) {
			res.status(200).send([]);
		}

		// helpers

		function getYelpReviews(res: any, latitude: number, longitude: number, radius: number) {
			console.log(`Starting to get Yelp Reviews at https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`);
			request.get(`https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`, function (error, response, businessData) {
		    	if (!error && response.statusCode == 200) {
		    		console.log("Got nearby Yelp businesses. Preparing to get reviews at these businesses...");
			        getYelpReviewsHelper(res, businessData);
			    }
			}).auth(null, null, true, 'WJyPjTDpx8fVoVYs4VegTXyEmqZQCMKIXy7oXPCfLoV1iufTFdpEDEF7N3Sbo4SL5arTOZNM-HoBDWT6JYfdLftdV96eFYgk-CbMfurcutKyu-GkSLWfy25nD8BjWnYx');
		}

		function getYelpReviewsHelper(res: any, businessData: any) {
			let parsedBusinessData = JSON.parse(businessData);
			var filteredBusinessData = parsedBusinessData.businesses.map(function (item: any) {
				return {
					"id": item.id,
					"latitude": item.coordinates.latitude,
					"longitude": item.coordinates.longitude
				};
			});
			
			let numIds = filteredBusinessData.length;
			var finished = 0;
			var buffer = [];
			filteredBusinessData.forEach(function(business: any) {
				request.get(`https://api.yelp.com/v3/businesses/${business.id}/reviews`, function (error, response, reviews) {
			    	if (!error && response.statusCode == 200) {
			    		let parsedReviews = JSON.parse(reviews);
			    		let reviewContents = parsedReviews.reviews.map(function (item: any) {
			    			return {
			    				"location": [business.longitude, business.latitude],
			    				"text": item.text,
			    				"rating": item.rating,
			    				"time": item.time,
			    				"provider": "yelp"
			    			};
			    		});
				        addToBuffer(reviewContents);
				    }
				    else {
				    	// console.log("there is an error in the request.");
				    	addToBuffer(null);
				    }
				}).auth(null, null, true, 'WJyPjTDpx8fVoVYs4VegTXyEmqZQCMKIXy7oXPCfLoV1iufTFdpEDEF7N3Sbo4SL5arTOZNM-HoBDWT6JYfdLftdV96eFYgk-CbMfurcutKyu-GkSLWfy25nD8BjWnYx');
			});

			var addToBuffer = (dataToAdd: any) => {
				finished += 1;
				// console.log(`Got ${finished} of ${numIds} responses`);

				if(dataToAdd != null) {
					dataToAdd.forEach(function(dataPoint: any) {
						buffer.push(dataPoint);
					})
				}

				// console.log(buffer);

				if(finished == numIds) {
					console.log("finishing yelp");
					collectProvider(res, buffer);
				}
			};
		}

		function getTwitterPosts(res: any, latitude: number, longitude: number, radius: number) {
			//change latitude and longitude to variables
			client.get('search/tweets', {q: `geocode:${latitude},${longitude},20km`,
			                                count:'100',
			                                tweet_mode:'extended'},
				function(error, tweets, response) {

				const latRadius = 0.04;
				const lonRadius = 0.05;

				var filteredTweets = tweets.statuses.map(item => {
					return {
						"location": [longitude, latitude],
						"text": item.full_text,
						"time": item.created_at,
						"provider": "twitter"
					};
				});

				console.log("finishing twitter");

				collectProvider(res, filteredTweets);
			});
		}

		function collectProvider(res, data) {
			completed += 1;
			resultAggregater.push(...data);

			console.log(`Finished ${completed} / ${numProviders} jobs,`);

			if(completed == numProviders) {
				res.status(200).send(resultAggregater);
			}
		}
	});
});