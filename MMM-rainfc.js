/* global Module */

/* Magic Mirror
 * Module: rainfc
 * Displays a sparkline graph of expected rain for a lon/lat pair based on a Dutch public Api (Buienradar)
 *
 * By Cirdan.
 */

Module.register("MMM-rainfc",{

	// Default module config.
	defaults: {
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay

		apiBase: "https://gpsgadget.buienradar.nl",
		rainfcEndpoint: "data/raintext",

		refreshInterval: 1000 * 60, //refresh every minute
		
		width: 300,
		height: 200,
		lineWidth: 2,
		showConsumption: false,
		lineColor: "#e0ffe0",
		fillColor: "#e0ffeo",

		maxPower: 300,
		oldData	: true,
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js", "jquery.sparkline.min.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["MMM-rainfc.css"];
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
		var max = this.config.nrOfTimeLabels ? this.config.nrOfTimeLabels : 0;

		if (max==0) {
			var currentRow = document.createElement("tr");
			var textrow = document.createElement("td");
			textrow.className = "normal rfc_textrow";
			textrow.setAttribute("colspan", max)
			textrow.id = "textrow";
			currentRow.appendChild(textrow);
			wrapper.appendChild(currentRow);
		}

		var graphRow = document.createElement("tr");
		var graph = document.createElement("td");
		graph.id = "sparkline";
		graph.setAttribute("colspan", max)
		graph.className = "small thin light";
		graph.innerHTML = "No Data";
		graphRow.appendChild(graph);
		wrapper.appendChild(graphRow);

		if (max>0) {
			var botRow = document.createElement("tr");
			for (i = 0; i < max; i++) {
				var labelrow = document.createElement("td");
				labelrow.className = "xsmall thin light rfc_labelrow";
				labelrow.id = "labelrow"+i;
				
				if (i==0) { labelrow.setAttribute("align","left"); }
				else if (i+1==max) { labelrow.setAttribute("align","right"); }
				else { labelrow.setAttribute("align","center"); }
				
				botRow.appendChild(labelrow);
			}
			wrapper.appendChild(botRow);
		}

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
		var lines = data.split("\n");
		var numLines = lines.length-1; // always a empty line at the end

		// This part to counter the unexected rain forecasts buienradar sends since nov 2018
		// if the first value is not in a timewindow  currenttime +/- 15 minutes, ignore the update
		// using old data is better than no data ;-)
		oldData	= true;
		var startTime   = moment().subtract(15, 'minutes');
		var endTime     = moment().add(15, 'minutes');
		var firstBrTime = lines[0].substring(lines[0].indexOf('|')+1 , lines[0].length);
		var compareTime = moment(firstBrTime, "HH:mm");
		if (!compareTime.isBetween(startTime, endTime)) {
			Log.info(self.name + ": unexpected rain forecast:" + 
				compareTime.format('HH:mm') +  " rain at " + moment().format('HH:mm'));
			return;
		}
		oldData = false; //used to add an * in the displayed time to indicate old data
		
		
		this.rain = 0; 
		this.rains = []; 
		this.times = []; 
		
		// parse phrases
		for (i = 0; i < numLines; i++) {
  			var line = lines[i];
			var pipeIndex = line.indexOf('|');
			r = line.substring(0, pipeIndex);
			t = line.substring(pipeIndex+1, line.length);
			//Log.info(self.name + ": parse rain forecast:" + r +  " rain at " + t);
			//Log.info(self.name + ": parse rain forecast:" + Math.pow(10, (parseInt(r)-109)/32) );
			
			this.rain = this.rain + parseInt(r); // if no rain expected dont show graph
			//this.rains.push( parseInt(r)); // a value between 0-255
			//Alternative for the 0-255 values
			//Neerslagintensiteit = 10^((waarde-109)/32), rain forecast in mm/hr
			this.rains.push( Math.pow(10, (parseInt(r)-109)/32));
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
			
			var max = this.config.nrOfTimeLabels ? this.config.nrOfTimeLabels : 0;
			
			if (!this.times || this.times.length == 0) {
				$("#sparkline").html("No Data");
				$("#textrow").html("");
				for (i = 0; i < max; i++) {
					$("#labelrow"+i).html("");
				}
	
				return;
			}


			if (this.rain == 0) {
				// if no rain expected, hide the graph
				$("#sparkline").html("");
				
				noRainText = this.config.noRainText ? this.config.noRainText : "No rain untill: ";
				noRainText = noRainText + this.times[this.times.length-1] ;
				noRainText = noRainText + (oldData?"*":"");
						
				if (max>0) {
					$("#textrow").html("");
					$("#labelrow"+(max-1)).html( noRainText);
					for (i = 0; i < max-1; i++) {
						$("#labelrow"+i).html("");
					}
				} else {
					$("#textrow").html(noRainText);
					for (i = 0; i < max; i++) {
						$("#labelrow"+i).html("");
					}
				}
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
				
				// show line for how long the rain forecast lasts or the labels beneath the graph
				if (max>0) {
					interval = Math.floor(this.times.length / (max-1));
					for (i = 0; i < max; i++) {
						if (i==0) { $("#labelrow0").html( this.times[0]+(oldData?"*":"")); }
						else if (i+1==max) { $("#labelrow"+i).html( this.times[this.times.length-1]); }
						else { $("#labelrow"+i).html( this.times[i*interval]); }
					}
				} else {
					rainText = this.config.rainText ? this.config.rainText : "Forecast untill: ";
					$("#textrow").html(rainText + this.times[this.times.length-1]+(oldData?"*":""));
				}
			}
		}
	} 	


});
