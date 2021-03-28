/* global Module */

/* Magic Mirror
 * Module: MMM-rainfc
 * Displays a graph of expected rain for a lon/lat pair based on a Dutch public Api (Buienradar)
 *
 * By Cirdan
 */

Module.register("MMM-rainfc",{

	// Default module config.
	defaults: {
		apiBase: "https://gpsgadget.buienradar.nl",
		rainfcEndpoint: "data/raintext",
		lat: 52.0,
		lon: 5.0,
		css: "MMM-rainfc.css",
		refreshInterval: 1000 * 60 * 15, //refresh every 15 minutes
		autohide: false,
		displaymode: "smooth",
		faultToleration: 5,
	},

	// Define required scripts.
	getStyles: function() {
		return [this.config.css];
	},

	// Define required translations.
	getTranslations: function() {
       		return {
            		en: "translations/en.json",
            		nl: "translations/nl.json",
			de: "translations/de.json",
        	};
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
                this.nodatacount = 0;
		this.sendSocketNotification('CONFIG', this.config);
        	if (!["line", "smooth", "block"].includes(this.config.displaymode)) {
			Log.warn(this.name + ": invalid or no displaymode in config, valid values are: line, smooth or block");
			this.confg.displaymode = "smooth";
		}
	},

 	// Override dom generator.
        getDom: function() {
		var wrapper = document.getElementById('sparkler');
		if (!wrapper) {
                   wrapper = document.createElement("div");
    		   wrapper.id = "sparkler";
		   wrapper.innerHTML = this.translate("STARTING");
                   wrapper.className = "small light rfc_text";
		}
                return wrapper;
        },

        // use the header to inform the user about stale data
        getHeader: function() 
        {
	        return this.data.header + (this.nodatacount>0?' (' + this.nodatacount + ')':'');
        },

    	// Make the graphic using SVG
    	makeSVG: function(raining,times){
         	/* The table is upside down therefor we calculate the line position down from the top of the canvas
         	 * received value 33 =>  100 - 33  = 67 on the canvas, M01,100 is the start
         	 */
        	var setPoints = this.config.displaymode=="block"? this.makeBlockSVG(raining) : this.makeSmoothOrLineSVG(raining);
        	
		var svg='<svg class="graph" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">';

		// smooth line will possibly draw below the y axis, clip everyting below the y axis
		svg+='<defs> <clipPath id="cut-off-bottom"> <rect x="0" y="0" width="300" height="100" /> </clipPath> </defs>';
        	//Set grid lines xAs and yAs size is determined in CSS
        	svg+='<g class="grid x-grid" id="xGrid"><line x1="1" x2="1" y1="00" y2="100"></line></g>';
        	svg+='<g class="grid y-grid" id="yGrid"><line x1="1" x2="300" y1="100" y2="100"></line></g>';
        	
		//Draw the line with the data
        	svg+='<g class="surfaces">';
        	svg+='<path class="first_set" d="' + setPoints + '" clip-path="url(#cut-off-bottom)"></path>';
        	svg+='</g>';
        	
		// Set the class for the grid
        	svg+='<use class="grid double" xlink:href="#xGrid" style=""></use><use class="grid double" xlink:href="#yGrid" style=""></use>';
        	
		// Time labels
        	svg+='<g class="labels x-labels">';
        	svg+='<text x="20"  y="115" >' + times[0]  + '</text>';
        	svg+='<text x="85"  y="115" >' + times[5]  + '</text>';
        	svg+='<text x="150" y="115" >' + times[11] + '</text>';
        	svg+='<text x="215" y="115" >' + times[17] + '</text>';
        	svg+='<text x="280" y="115" >' + times[raining.length-1] + '</text>';
		
		// Show max. rain in that timeframe
		//Log.info(this.maxrain);
		svg+='<text x="150" y="10" >' + this.translate("MAX") 
                   + ' ' + this.maxrain + ' ' + this.translate("AMOUNT") + '</text>';
		svg+='</g></svg>';
		
		//Log.error(this.name + ": svg:" + svg);
        	return svg;
    	},
    	
	// Make the line or smooth graphic using SVG
    	makeSmoothOrLineSVG: function(raining){
        	
		var setPoints='M1,100 ' + 
			       (this.config.displaymode=="line"?'L ':'S ');
        	// loop through the received data array raining[] normally 24 position 0 to 23
        	for (i=0,xAs=1;i<raining.length;i++,xAs+=13){
            		setPoints +=  xAs + ',' + (100-raining[i]) + ' ';
        	}
        	setPoints += 'L300,100 Z';
		return setPoints;
	},
	
	// Make the block graphic using SVG
    	makeBlockSVG: function(raining){
        	
		var setPoints='M1,100 L ';
        	// loop through the received data array raining[] normally 24 position 0 to 23
        	for (i=0,xAs=1;i<raining.length;i++,xAs+=13){
            		setPoints +=  xAs + ',' + (100-raining[i]) + ' ';
            		setPoints +=  (xAs+12) + ',' + (100-raining[i]) + ' ';
        	}
        	setPoints += 'L300,100 Z';
		return setPoints;
	},

	/* processRainfc(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received via buienradar.nl.
	 */
	processRainfc: function(data) {

		this.totalrain = 0;
		this.maxrain=0; 
		this.rains = []; 
		this.times = []; 
		
		// parse phrases
		var lines = data.split("\n");
		var numLines = lines.length-1; // always a empty line at the end
		for (i = 0; i < numLines; i++) {
  			var line = lines[i];
			var pipeIndex = line.indexOf('|');
			r = parseInt(line.substring(0, pipeIndex));
			t = line.substring(pipeIndex+1, line.length);
			
 			// calculate totalrain (if no rain expected don't show graph)
			this.totalrain +=  r;

			// determine maximum amount of rain
			if (r > this.maxrain) {
				this.maxrain = r;
				//Log.info("r = " + r);
			}
			
			this.rains.push( r / 2.55 );
			this.times.push( t );
		}

		// calculate rain in mm/h and round to 2 digits
		if (this.maxrain > 0) {
			this.maxrain = Math.round(Math.pow(10, (this.maxrain-109)/32) * 100) / 100;
			//Log.info("maxrain = " + this.maxrain);	
		}

		// Issue12
		// sometimes the api returns not for 2 hours of data, but a susbset. We complete the set to 2 hours
		// there should be 24 entries, times is used to indicate the incompleteness of the answer, by using a #
		for (i = this.rains.length; i < 24; i++) {
			this.rains.push( 0 );
			this.times.push( '#' );
		}
	},

	/* socketNotificationReceive(notification)
	 * used to get communication from the nodehelper
	 *
	 * argument notification object - status label from nodehelper.
	 * argument payload object - Weather information received via buienradar.nl.
	 */
       	socketNotificationReceived: function(notification, payload) {

		spark = document.getElementById('sparkler');

		// configured succesfully
    		if (notification === "STARTED") {
			Log.info(this.name + ": rain forecast configured");
			spark.innerHTML = this.translate("STARTED");
		} else 
       		// error received from node_helper.js
       		if (notification === "ERROR") {
			Log.error(this.name + ": rain forecast error: " + payload);
			spark.innerHTML = this.translate("ERROR");
       		} else
		// data received
       		if (notification === "DATA") {
       			// data received from node_helper.js, but empty payload (api calls return empty string sometimes)
			if (!payload || payload ==="") {
                                this.nodatacount++;
				nodata = this.translate("NODATA");
				Log.warn(this.name + ": " + nodata);
				if (this.nodatacount < this.config.faultToleration) {
                                        // leave the graph, old data is better than an errormessage, 
                                        // show nr of failed calls betweeen brackets in header (see getHeader())
                                } else {
				        spark.innerHTML = nodata;
                                }
			} else 
			// data received and payload to parse
			{
                        	this.nodatacount=0; // reset counter
				this.processRainfc(payload);
       	 			// no rain calculated from procesRainfc
       	 			if (this.totalrain == 0) {
					Log.info(this.name + ": no rain expected");
					noRainText = this.translate("NORAIN") + ' ' 
					   	+ this.times[this.times.length-1] ;
					spark.innerHTML = noRainText;
	
					// experimental: option to completly hide the module if no rain is expected
					if (this.config.autohide) this.hide();
       	 			} else {
					Log.info(this.name + ": rain expected");
					spark.innerHTML = this.makeSVG(this.rains,this.times);
					// experimental: option to completly hide the module if no rain is expected:
					// show it again  when an update comes in with rain
					if (this.config.autohide) this.show();
				}
			}
       	 	}
                this.updateDom();
    	},

});
