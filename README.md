# MMM-Rainfc

Magic Mirror - Dutch Rain Forecast

Based on a Dutch public api for rain forecast (BuienRadar). 
![call](https://github.com/73cirdan/MMM-rainfc/blob/master/screenshot2.png)

# Installation
Navigate into your MagicMirror's `modules` folder and execute


`git clone https://github.com/73cirdan/MMM-rainfc`


After that go into the `MMM-rainfc` folder and excute


`npm install`
 
# Using the module
This module can show the rainforecast in your neighbourhood using longitude and latitude.

# Version

|Version|Description|
|---|---|
|`Version 2.2.1`|**bufix**<br>added an optional config option for users with a Axios get error (issue20) |
|`Version 2.2.0`|**merge**<br>replaced `request` module with `axios` module|
|`Version 2.1.1`|**bugfix**<br>added package.json in order to counter missing `request` module (issue15)|
|`Version 2.1`|**bugfix**<br>handle incomplete delivery of data by the api (issue12)|
|`Version 2.0`|**Second version inspired by the svg work of spoturdeal with the SVG graph. I did a rewrite**<br>-module no longer depedending on external scripts<br>-deprecated of lot of config options, added a configurable css option, to enable all your custimization needs<br>-improved error handling<br>-refactoring code<br>-support for multiligual use<br>-experimental support for autohide; this hides the module completely when no rain is expected<br>- multiple display modes<br>-fault toleration|
|`Version 1.0`| **first version was based on jquery and sparkline**|
 

## Config options
The following properties can be configured:

|Option|Description|
|---|---|
|`lat`| The latitude of your position.<br>**Type:** `Float`<br>**Default:** <i>52.0</i>|
|`lon`| The longitude of your position.<br>**Type:** `Float`<br>**Default:** <i>5.0</i>|
|`displaymode`|  There are three display modes, see the screen shot, in order from top to bottom <i>smooth</i>, <i>block</i> or <i>line</i>. <br>**Type:** `string` <br>**Default:**<i> smooth<i>|
|`css`| (optional) The file to use when changing the look (alignment, font, color) of the module<br>**Type:** `string`<br>**Default:** <i>MMM-rainfc.css</i>|
|`refreshInterval`| (optional) Time to wait for refresh <br>**Type:** `number`<br>**Default:** <i>900000</i><br>**Remark:** Time to download new data in milisecond (15*60*1000)|
|`faultToleration`| (optional) Number of 'no responses' from the buienradar server you accept before an error is shown instead of the grapg/no rain text <br>**Type:** `number`<br>**Default:** <i>5</i><br>**Remark:** Remark, if the header shows e.g. (2) behind the title, 2 attempts failed and the data shown is somewhat stale.|
|`autohide`| (expiremental) Completely hide the module (including header) when no rain is expected <br>**Type:** `boolean`<br>**Default:** <i>false</i>|
|`axiosfix`| fixes issue 20, set to "PostmanRuntime/7.26.2"<br>**Type** `String`<br>**Default:**<i>Do not use, if there is no problem</i>|,

**Deprecated**
No longer needed, see css file for tunning or make your own custom css to prevent overwrite during pull.
|Option|Description|
|---|---|
|`width` | controls the size of the module|
|`height` | controls the size of the module|
|`lineWidth` | the thicknes of the line|
|`lineColor` | the color of the line|
|`fillColor` | the color of the area under the line|
|`maxPower` | the maximum number on the y axis|
|`rainText` | The text you want to display in front of the last time received in the last call|
|`noRainText` |	The text you want to display if no rain is expected untill the last time in the last call.|
|`nrOfTimeLabels` | optional value, adds a number of time labels under the graph.|

## Example config.js content for this module
		{
			module: "MMM-rainfc",
			position: "top_right",
                	header: "Rain forecast",
			config: {
				lat: "52.1",
				lon: "4.90", 
				displaymode: "smooth",
			}
		},
## Dutch Explanation of the Api and Source
Data is provided by buienradar (https://www.buienradar.nl/overbuienradar/gratis-weerdata ), permission for non commercial use. Excerpt from the site:

(1.0) Neerslagdata op basis van coördinaten

Op basis van de door u gewenste coördinaten (latitude en longitude) kunt u de neerslag tot twee uur vooruit ophalen in tekstvorm. De data wordt iedere 5 minuten geüpdatet. Op deze pagina kunt u de neerslag in tekst vinden. De waarde 0 geeft geen neerslag aan (droog), de waarde 255 geeft zware neerslag aan. Gebruik de volgende formule voor het omrekenen naar de neerslagintensiteit in de eenheid millimeter per uur (mm/u):

Neerslagintensiteit = 10^((waarde-109)/32)

Ter controle: een waarde van 77 is gelijk aan een neerslagintensiteit van 0,1 mm/u.

The MIT License (MIT) 
===================== 
Copyright 2017 Cirdan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. **The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.** 

