'use strict';

/* Magic Mirror
 * Module: rainfc
 *
 * Adapted for Dutch system by Cirdan
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

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
		
		var rainfcUrl = this.config.apiBase + "/" + this.config.rainfcEndpoint + "?lat=" + this.config.lat + "&lon="+ this.config.lon;
		console.log(self.name + ": loading rain forecast for : " + rainfcUrl);
				
		request({
			url: rainfcUrl,
			method: 'GET',
		}, function (error, response, body) {
			console.log(self.name + ": rain forecast data: " + body);
        // This is test data just to see the graph if there is no rain
        body="077|10:05\n034|10:10\n101|10:15\n087|10:20\n077|10:25\n240|10:30\n000|10:35\n000|10:40\n077|10:45\n087|10:50\n087|10:55\n077|11:00\n077|11:05\n034|11:10\n017|11:15\n000|11:20\n000|11:25\n000|11:30\n000|11:35\n000|11:40\n000|11:45\n000|11:50\n100|11:55\n200|12:00\n";

			console.log(self.name + ": rain forecast data: " + body);
			
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			} else {
				error = "No forecast data, will retry";
				console.log(self.name + error);
				self.sendSocketNotification("ERROR", error);
			}
		});

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
