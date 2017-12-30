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
		
		// example: https://br-gpsgadget-new.azurewebsites.net/data/raintext?lat=51&lon=3
		var rainfcUrl = this.config.apiBase + "/" + this.config.rainfcEndpoint + "?lat=" + this.config.lat + "&lon="+ this.config.lon;
		//console.log(self.name + ": loading rain forecast for : " + rainfcUrl);
				
		request({
			url: rainfcUrl,
			method: 'GET',
		}, function (error, response, body) {
			
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			} else {
				console.log(self.name + ": Could not load rain forecast data, will retry");
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
		}
	}
});
