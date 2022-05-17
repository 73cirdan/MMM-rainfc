'use strict';

/* Magic Mirror
 * Module: rainfc
 *
 * Adapted for Dutch system by Cirdan
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const axios = require('axios').default;

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
	},

	/*
	 * Requests new data from openov.nl.
	 * Calls processBusTimes on succesfull response.
	 */
	getData: function() {
		var self = this;
		
		var rainfcUrl =  this.config.apiBase + "/" + this.config.rainfcEndpoint + "?lat=" + this.config.lat + "&lon="+ this.config.lon;
		console.log(self.name + ": loading rain forecast for : " + rainfcUrl);
				
		
		axios.get(rainfcUrl)
  			.then(function (response) {
    				// handle success console.log(response);
				self.sendSocketNotification("DATA", response.data);
  			})
  			.catch(function (error) {
    				// handle error
    				if (error.response) {
      					// The request was made and the server responded with a status code
      					// that falls out of the range of 2xx
      					console.log("Error: " + self.name + ": " + error.response.status);
      					console.log("Error: " + self.name + ": " + error.response.data);
      					console.log("Error: " + self.name + ": " + error.response.headers);
    				} else if (error.request) {
      					// The request was made but no response was received
      					console.log("Error: " + self.name + ": " + error.request);
    				} else {
      					// Something happened in setting up the request that triggered an Error
      					console.log("Error: " + self.name + ": " + error.message);
    				}
    				//console.log(error.config);
				self.sendSocketNotification("ERROR", self.name + "No forecast connection, will retry");
  			})
		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
			console.log(self.name + ": configured");
		}
	}
});


/*
        		// This is test data just to see the graph if there is no rain
        		body=   "077|10:05\n034|10:10\n101|10:15\n087|10:20\n"+
				"077|10:25\n020|10:30\n000|10:35\n000|10:40\n"+
				"077|10:45\n087|10:50\n087|10:55\n127|11:00\n"+
				"137|11:05\n034|11:10\n170|11:15\n000|11:20\n"+
				"000|11:25\n000|11:30\n000|11:35\n000|11:40\n"+
				"010|11:45\n020|11:50\n030|11:55\n043|12:00\n";
        		// This is test data just to see how the code handles a incomplete receipt
        		body=   "077|10:05\n034|10:10\n101|10:15\n087|10:20\n"+
				"077|10:25\n020|10:30\n000|10:35\n000|10:40\n"+
				"077|10:45\n087|10:50\n087|10:55\n127|11:00\n";
			console.log(self.name + ": rain forecast data: " + body);
*/
