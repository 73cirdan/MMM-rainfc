/* global Module */

/* Magic Mirror
 * Module: rainfc
 * Displays a sparkline graph of expected rain for a lon/lat pair based on a Dutch public Api (Buienradar)
 *
 * By Cirdan.
 */

Module.register("rainfc",{

	// Default module config.
	defaults: {
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay

		// https://br-gpsgadget-new.azurewebsites.net/data/raintext?lat=51&lon=3
		apiBase: "https://br-gpsgadget-new.azurewebsites.net",
		rainfcEndpoint: "data/raintext",

		refreshInterval: 1000 * 60, //refresh every minute
		
		width: 300,
		height: 200,
		lineWidth: 2,
		showConsumption: false,
		lineColor: "#e0ffe0",
		fillColor: "#e0ffeo",

		maxPower: 300,
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js", "jquery.sparkline.min.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["rainfc.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("table");
		wrapper.align = "center";
		wrapper.style.cssText = "width: " + this.config.width + "px";
		var currentRow = document.createElement("tr");
		var textrow = document.createElement("td");
		textrow.className = "small thin light";
		textrow.id = "textrow";
		currentRow.appendChild(textrow);
		wrapper.appendChild(currentRow);

		var graphRow = document.createElement("tr");
		var graph = document.createElement("td");
		graph.id = "sparkline";
		graph.className = "small thin light";
		graph.innerHTML = "No Data";
		graphRow.appendChild(graph);
		wrapper.appendChild(graphRow);

		return wrapper;
	},
	
	/* processRainfc(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received via buienradar.nl.
	 */
	processRainfc: function(data) {

		if (!data ) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.error(self.name + ": Could not parse rain forecast, will retry");
			return;
		}
		
		this.rain = 0; 
		this.rains = []; 
		this.times = []; 
		
		var lines = data.split("\n");
		var numLines = lines.length-1; // always a empty line at the end

		// parse phrases
		for (i = 0; i < numLines; i++) {
  			var line = lines[i];
			var pipeIndex = line.indexOf('|');
			r = line.substring(0, pipeIndex);
			t = line.substring(pipeIndex+1, line.length);
			//Log.info(self.name + ": parse rain forecast:" + r +  " rain at " + t);
			//Log.info(self.name + ": parse rain forecast:" + Math.pow(10, (parseInt(r)-109)/32) );
			
			this.rain = this.rain + parseInt(r); // if no rain expected dont show graph
			this.rains.push( parseInt(r)); // a value between 0-255
			//Alternative for the 0-255 values
			//Neerslagintensiteit = 10^((waarde-109)/32), rain forecast in mm/hr
			//this.rains.push( Math.pow(10, (parseInt(r)-109)/32));
			this.times.push( t );
		}

		this.loaded = true;
	},


	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
			this.updateDom();
		}
		else if (notification === "DATA") {
			this.processRainfc(payload);

			if (this.rain == 0) {
				noRainText = this.config.noRainText ? this.config.noRainText : "No rain untill: ";
				// if no rain expected, hide the graph
				$("#textrow").html( noRainText + this.times[this.times.length-1]);
				$("#sparkline").html("");
			} else {
				$("#sparkline").sparkline(
					this.rains, {
						type: 'line',
						width: this.config.width,
						height: this.config.height,
						lineColor: this.config.lineColor,
						fillColor: this.config.fillColor,
						spotColor: false,
						minSpotColor: false,
						maxSpotColor: false,
						lineWidth: this.config.lineWidth,
						chartRangeMin: 0,
						chartRangeMax: this.config.maxPower,
					});
				
				rainText = this.config.rainText ? this.config.rainText : "Forecast untill: ";
				// show line for how long the rain forecast lasts
				$("#textrow").html(rainText + this.times[this.times.length-1]);
			}
		}
	} 	


});
