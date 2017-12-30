# bustimes
Magic Mirror - Dutch Rain Forecast

Based on a Dutch public api for rain forecast (BuienRadar). 
![call](https://github.com/73cirdan/MMM-rainfc/blob/master/screenshot2.png)

# Installation
Navigate into your MagicMirror's `modules` folder and execute
 'git clone https://github.com/73cirdan/MMM-rainfc rainfc'
# Using the module
This module can show the rainforecast in your neighbourhood using longitude and latitude.

## Config options
The following properties can be configured:

First Header | Second Header
------------ | ------------- 
lon | the longitude of your location
lat | the latitude of your location
text | sets the text to display if no rain is to be expected

## Example config.js content for this module
		{
			module: "bustimes",
			position: "top_left",
                	header: "Bustimes",
			config: {
				displaymode: "small",
				departs: 3 
		},
tt
tt
tt

{
module: "rainfc",
position: "top_right",
header: "Rain forecast next 2 hours",
config: {                                 
lat: "52.37",                                 
lon: "4.90",                                 
width: 200,                                 
height: 150,                                 
lineWidth: 2,                                 
lineColor: "#e0ffe0",                                 
fillColor: "#e0ffe0",                                 
maxPower: 300,                                 
rainText: "Tot: ",                                 
noRainText: "Geen regen tot: "                         
}                 
},
## Dutch Explanation of the Api
(1.0) Neerslagdata op basis van coördinaten

Op basis van de door u gewenste coördinaten (latitude en longitude) kunt u de neerslag tot twee uur vooruit ophalen in tekstvorm. De data wordt iedere 5 minuten geüpdatet. Op deze pagina kunt u de neerslag in tekst vinden. De waarde 0 geeft geen neerslag aan (droog), de waarde 255 geeft zware neerslag aan. Gebruik de volgende formule voor het omrekenen naar de neerslagintensiteit in de eenheid millimeter per uur (mm/u):

Neerslagintensiteit = 10^((waarde-109)/32)

Ter controle: een waarde van 77 is gelijk aan een neerslagintensiteit van 0,1 mm/u.

The MIT License (MIT) 
===================== 
Copyright 2017 Cirdan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. **The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.** 

