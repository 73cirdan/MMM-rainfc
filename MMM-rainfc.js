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
		lang: config.language,
		apiBase: "https://gpsgadget.buienradar.nl",
		rainfcEndpoint: "data/raintext",
		lat: 52,
		lon: 5,
		css: "MMM-rainfc.css",
		refreshInterval: 1000 * 60, //refresh every minute
		pleaseWait: "Please wait.",
		autohide: true,
	},

	// Define required scripts.
	getStyles: function() {
		return [this.config.css];
	},

	// Define required translations.
	getTranslations: function() {
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.sendSocketNotification('CONFIG', this.config);

	},

 	// Override dom generator.
        getDom: function() {
                var wrapper = document.createElement("div");
                wrapper.align = "center";
    		wrapper.id = "sparkler";
                wrapper.className = "small thin light";
                return wrapper;
        },

    	// Make the graphic using SVG
    	makeSVG: function(raining,times){
        	/* We start at position
         	 * The table is upside down therefor we calculate the line position down from the top of the canvas
         	 * received value 77 = 100 - 38 = 72 on the canvas
         	 * M01,200 is the start
         	 */
        	//var setPoints='M01,100';
        	var setPoints='M01 100 S ';
        	// loop through the received data array raining[] normally 24 position 0 to 23
        	var xAs=1;
        	for (i=0;i<raining.length;i++){
            		xAs = (xAs==1?xAs=2:xAs+13);
            		//setPoints += ', L' + xAs + ',' + (100-raining[i]);
            		setPoints +=  xAs + ',' + (100-raining[i]) + ' ';
        	}
        	// End of the line, make sure it drops to the bottom of the canvas to avoid silly fill
        	setPoints +='L300,100 Z';
        	//setPoints +=', L' + xAs + ',100 Z';
        	
		var svg='<svg class="graph" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">';

		// smooth line will possibly draw below the y axis, clip everyting below the y axis
		svg+='<defs> <clipPath id="cut-off-bottom"> <rect x="0" y="0" width="300" height="100" /> </clipPath> </defs>';
        	//Set grid lines xAs ans yAs size is determined in CSS
        	svg+='<g class="grid x-grid" id="xGrid"><line x1="1" x2="1" y1="00" y2="100"></line></g>';
        	svg+='<g class="grid y-grid" id="yGrid"><line x1="1" x2="300" y1="100" y2="100"></line></g>';
        	
		//Draw the line with the data
        	svg+='<g class="surfaces">';
        	//svg+='<path class="first_set" style="fill:' + this.config.fillColor + '" d="' + setPoints + '" clip-path="url(#cut-off-bottom)"></path>';
        	svg+='<path class="first_set" d="' + setPoints + '" clip-path="url(#cut-off-bottom)"></path>';
        	svg+='</g>';
        	
		// Set the class for the grid
        	svg+='<use class="grid double" xlink:href="#xGrid" style=""></use><use class="grid double" xlink:href="#yGrid" style=""></use>';
        	
		// Time labels
        	svg+='<g class="labels x-labels">';
        	svg+='<text x="20"  y="115" >' + times[0]  + '</text>';
        	svg+='<text x="85"  y="115" >' + times[5]  + '</text>';
        	svg+='<text x="150" y="115" >' + times[11]+ '</text>';
        	svg+='<text x="215" y="115" >' + times[17] + '</text>';
        	svg+='<text x="280" y="115" >' + times[raining.length-1] + '</text>';
        	svg+='</g></svg>';

		Log.error(self.name + ": svg:" + svg);
        	return svg;
    	},

	
	/* processRainfc(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received via buienradar.nl.
	 */
	processRainfc: function(data) {

		this.rain = 0; 
		this.rains = []; 
		this.times = []; 
		
		// parse phrases
		var lines = data.split("\n");
		var numLines = lines.length-1; // always a empty line at the end
		for (i = 0; i < numLines; i++) {
  			var line = lines[i];
			var pipeIndex = line.indexOf('|');
			r = line.substring(0, pipeIndex);
			t = line.substring(pipeIndex+1, line.length);
			
			this.rain = this.rain + parseInt(r); // if no rain expected dont show graph
			this.rains.push( r=="NaN"?0:parseInt(parseInt(r)/2.55));
			this.times.push( t );
			Log.error(self.name + ": parse rain forecast:" + r +  " rain at " + t + " total forecast:" + this.rain);
		}
	},

       	socketNotificationReceived: function(notification, payload) {

		spark = document.getElementById('sparkler');

		// configured succesfully
    		if (notification === "STARTED") {
			//$("#sparkler").html("Configured");
			Log.error(self.name + ": geb: " + document.getElementById('sparkler'));
			Log.error(self.name + ": rain forecast configured");
			spark.innerHTML = "Configured";
			//this.updateDom();
			return;
		}
       		// error received from node_helper.js
       		if (notification === "ERROR") {
			Log.error(self.name + ": rain forecast error: " + payload);
			spark.innerHTML = payload;
       	   		return;
       		}
       		if (notification === "DATA") {
       			// no data received from node_helper.js
			if (!payload || payload ==="") {
				error = "No data received, will retry";
				Log.error(self.name + ": " + error);
				spark.innerHTML = error;
				return;
			}
			this.processRainfc(payload);
       	 		// no rain calculated from in node_helper.js
       	 		if (this.rain == 0) {
				Log.error(self.name + ": rain forecast no error");
				noRainText = this.config.noRainText ?
					     this.config.noRainText : 
					     "No rain untill: ";
				noRainText += this.times[this.times.length-1] ;
				spark.innerHTML = noRainText;

				// experimental: option to completly hide the module if no rain is expected
				if (this.config.autohide) this.hide();
       	 		} else {
				Log.error(self.name + ": rain forecast drawing");
				spark.innerHTML = this.makeSVG(this.rains,this.times);
				// experimental: option to completly hide the module if no rain is expected:
				// show it again  when an update comes in with rain
				if (this.config.autohide) this.show();
			}
       	 	}
    	},

});
