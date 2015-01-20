var inflation = (function($) {
	var model = {}

	// location of csv data and also page containing update date


	// Links for PREVIEW 
	//, BASE_URL = "http://wasppreview/ons/datasets-and-tables/downloads/csv.csv"
	//, UPDATE_URL = "http://wasppreview/ons/datasets-and-tables/data-selector.html?dataset=mm23"


	// Links for LIVE  
	//, BASE_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv"
	//, UPDATE_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/data-selector.html?dataset=mm23"

	// static version using local data snapshot
	, BASE_URL = "dataset.csv" 


	//, BASE_URL = "proxy_dataset.php"
	, UPDATE_URL = "data-selector.html"
	, DOWNLOAD_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv?dataset=mm23&cdid="
	, INITIAL_LIST = "D7G7,D7BT,L522,L55O,KVR8,KVR9,CHAW,CZBH,CHMK,CDKQ"

	, titles = [
		"CPI: Consumer Prices Index"                                                
		, "CPIH: Consumer Prices Index including owner occupiers’ housing costs"        
		, "RPIJ: Retail Prices Index calculated using the Jevons Formula"                        
		, "RPI: Retail Prices Index"                                                                
		, "RPIX: Retail Prices Index excluding mortgage interest payments" 
	]


	, MONTHLY = "M"
	, QUARTERLY = "Q"
	, YEARLY = "Y"

	, dataset = "mm23"
	, chart
	, rawData
	, yearArray
	, qtrArray
	, monthArray

	, seriesData = []
	, descriptions = []
	, measures = []
	, id = []
	, cdids =[]

	, lastValues
	, penultimateValues
	, colours = ["#003D57","#A8BD3A","#C5000B","#90B0C9","#FF950E","#7E0021","#FF420E","#314004","#FFD320", "#000000"]
	, monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
	, chartOptions
	, chartTitle
	, units
	, customInterval = {}
	, xAxisStartPoint
	, startDate = Array(10)

	, $menu
	, baseYear
	, baseValues = []


	, tableObjects ={}


	, formalTitles = {
		  "D7BT":"CPI - Index, 2005=100"
		, "D7G7":"CPI (% change)"
		, "L522":"CPIH - Index, 2005=100"
		, "L55O":"CPIH (% change)"
		, "KVR8":"RPIJ - Index, 1987=100"
		, "KVR9":"RPIJ (% change)"
		, "CHAW":"RPI - Index, Jan 1987=100"
		, "CZBH":"RPI (% change)"
		, "CHMK":"RPIX - Index, Jan 1987=100"
		, "CDKQ":"RPIX (% change)"
	}

	, measureColours = {
		  "D7BT": colours[0]
		, "D7G7": colours[0]
		, "L522": colours[1]
		, "L55O": colours[1]
		, "KVR8": colours[2]
		, "KVR9": colours[2]
		, "CHAW": colours[3]
		, "CZBH": colours[3]
		, "CHMK": colours[4]
		, "CDKQ": colours[4]
	}	

	, measureIndex = {
		  "D7BT": 0
		, "D7G7": 5
		, "L522": 1
		, "L55O": 6
		, "KVR8": 2
		, "KVR9": 7
		, "CHAW": 3
		, "CZBH": 8
		, "CHMK": 4
		, "CDKQ": 9
	}
	, titleOrder = [
		  "D7BT"
		, "D7G7"
		, "L522"
		, "L55O"
		, "KVR8"
		, "KVR9"
		, "CHAW"
		, "CZBH"
		, "CHMK"
		, "CDKQ"
	]
	, tableOrder = {
		  "D7BT": 4
		, "D7G7": 5
		, "L522": 8
		, "L55O": 9
		, "KVR8": 6
		, "KVR9": 7
		, "CHAW": 1
		, "CZBH": 3
		, "CHMK": 2
		, "CDKQ": 0
	}

	, defaultTitle = ""
	, defaultSubTitle = ""

	// Highchart options/format
	, titleObj = {
		text: defaultTitle
		, style: {
			fontFamily: 'Arial,Helvetica,sans-serif'
			, color: '#333'
		}
	}
	, subTitleObj = {
		text: defaultSubTitle
		, style: {
			fontFamily: 'Arial,Helvetica,sans-serif'
			, color: '#333'
		}
	}
	, itemStyleObj ={
		fontFamily: 'Arial,Helvetica,sans-serif'
		, color: '#333'
	}
	, xAxisStyleObj = {
		fontFamily: 'Arial,Helvetica,sans-serif'
		, color: '#333'
		, fontSize : '12px'
	}
	, yAxisStyleObj = {
		fontFamily: 'Arial,Helvetica,sans-serif'
		, color: '#333'
		, fontSize : '12px'
		, fontWeight: '600'
	}

	, lineChart = {
		chart: {
			renderTo: 'chart'
			, type: 'line'
			, width: 600
			, height: 290
			, marginTop: 40
			, borderRadius:0
			, zoomType: 'x'
			, resetZoomButton: {
				position:{
					x: 5
					, y:5
				}
			}
			, ignoreHiddenSeries: true
		}


		, title: titleObj
		, subtitle: subTitleObj
		, xAxis: {
			title: {
				text: ''
				, style: xAxisStyleObj
			}
			, type: 'datetime'
			, labels:{
				style: xAxisStyleObj
				, y:25
			}
		}
		, yAxis: {
			title: {
				align: 'high'
				, offset: 0
				, text: ''
				, rotation: 0
				, y: -20
				, style: yAxisStyleObj
			},
			plotLines: [{
				value: 0
				, width: 1
				, color: '#808080'
			}]
			, labels:{
				style: yAxisStyleObj
				, x: -20
			}

		}

		, plotOptions:{
			line : {
				marker:{
					enabled:false
				}
				, 
				events: {
					legendItemClick: function () {
						return false;
					}
				}
			}
		}

		, tooltip: {
		}

		, legend: {
			enabled:true
			, labelFormatter: function() {
				var name = this.name;
				if(name.indexOf("%")===-1){
					name = this.name.substring(0,4);
				}
				return name;
			}

			, layout: 'horizontal'
			, align: 'center'
			, verticalAlign: 'bottom'
			, x: 0
			, y: 0
			, floating: false
			, borderWidth: 0
			, itemStyle: itemStyleObj
			, itemHiddenStyle: {
			}
		}

		, credits:{
			enabled:false
		}
		, exporting:{
			enabled:false
		}
	};



	//formatter function for different tooltips
	var monthFormat = function () {
		var s ,
		d = new Date(this.point.category);

		s = '<b>' + this.point.series.name + '</b><br/>';
		s += monthNames[d.getMonth()] + " " + Highcharts.dateFormat('%Y', this.x);
		s += ': ';
		s += this.point.y;
		return s;
	};


	var qtrFormat = function () {
		var s = '<b>',
		d = new Date(this.point.category),
	    q = Math.floor((d.getMonth() + 3) / 3); //get quarter

	    s += "Q" + q ;
	    s +=  " " + Highcharts.dateFormat('%Y', this.x) + '</b>';
	    s += '<br/>' + this.point.series.name + ': ';
	    s += this.point.y;
    	return s;
  	};


	var yearFormat = function () {
		var s = '<b>';
		s += Highcharts.dateFormat('%Y', this.x) + '</b>';
		s += '<br/>' + this.point.series.name + ': ';
		s += this.point.y;
		return s;
	};


	var normalFormat = function(){
		return this.value;
	}


	function isIE () {
		var myNav = navigator.userAgent.toLowerCase();
		return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
	}


	// function to call ONS website with actual CDIDs
	function getData(ref){
		var cdid = ref
		, url = "blank"

		$.ajax({
			dataType: "text",
			url: BASE_URL,
			data: "dataset=" + dataset + "&cdid=" + cdid,
			success: function(data) {

				rawData = data.split("\n");
				splitRawData();

				if (!isIE() || isIE() >= 9) {
					getUpdatePage();
				}else  {
					// is IE version less than 9
					$("#last_date").text("");
				}

			},
			error: function (xhr, textStatus, errorThrown) {
					/*
					console.warn("error");
					//console.log(xhr);

					//console.log(textStatus);
					//console.log(errorThrown);
					*/
				}
			});
	}


	// function to call ons website for HTML page containg last updated date
	function getUpdatePage(ref){
			var cdid = ref
			, url = "blank"

			$.ajax({
				dataType: "text",
				url: UPDATE_URL,
				success: function(data) {

					var part = data.split("<div>Last updated: ")[1];
					part = part.split("</div>")[0];

					$("#last_date").text("Last updated: " + part);
				},
				error: function (xhr, textStatus, errorThrown) {
					alert("Error loading date");
					/*
					//console.log(xhr);

					//console.log(textStatus);
					//console.log(errorThrown);
					*/
				}
			});
		}


		/////////////////////////////////////////////////////////////////////////////////////////
		//
		//	split the CSV data into the component parts:
		//	month, quarter and year arrrays
		//	plus measures and the last values
		//	
		//	also builds set of objects with the associated data
		//  {
		//	baseValue		- used to re-base the indices
		//	color 			- chart colour
		//	data 			- legacy
		//	data_mon		- formatted monthly chart data: array of objects {date:millisecondsUTC, value}
		//	data_qtr
		//	data_yr
		//	endDate 		- last date value
		//	name 			- series name from CSV
		//	startDate		- first available date
		//	visible	 		- is chart line visible
		//	}
		//
		/////////////////////////////////////////////////////////////////////////////////////////
		function splitRawData(){
			var i
			, j
			, listLength = rawData.length
			, valueList = rawData[0].split(",")
			, numValues = valueList.length - 1;

			yearArray  = [];
			qtrArray   = [];
			monthArray = [];
			descriptions = [];
			measures = [];
			cdids =[];

			id = rawData[0].slice(1).split(",");	// remove the first entry (timestamp)

			for ( i = 0; i < listLength; i++) {
				rawData[i] = rawData[i].split(",");

				if(rawData[i][0]){
					var dateLength = rawData[i][0].length;

					if(dateLength===6){												// YEAR
						var date = rawData[i][0].substr(1,4)
						yearArray.push( {date:date, value:rawData[i].slice(1)} );
					} else if (dateLength===9){										// QUARTER
						var date = rawData[i][0].substr(1,7);
						qtrArray.push( {date:date, value:rawData[i].slice(1)} );
					}else if (dateLength===10){										// MONTH
						var date = rawData[i][0].substr(1,8);
						monthArray.push( {date:date, value:rawData[i].slice(1)} );
					}

				}

			}

			// IMPORTANT this steps back through the csv data and gets the measure and description from the end of the file
			// REVERSE these so that they are in the same order as the values
			for ( i = 1; i <=numValues; i++) {
				var line = listLength - (i*5) - 1;
				var descriptionStr = rawData[line][1].split("\"")[1];
				var tempStr = descriptionStr.split(" ")[0];
				var cdid = rawData[line][0];
				measures.push( tempStr );
				descriptions.push( rawData[line] );
				cdids.push(cdid);
			}

			// REVERSE these so that they are in the same order as the values
			measures.reverse();
			descriptions.reverse();
			cdids.reverse();


			//set last values and the difference
			lastValues = monthArray[monthArray.length-1];
			penultimateValues = monthArray[monthArray.length-2];

			for ( i = 0; i <=measures.length; i++) {
				var measure = measures[i];
				var cdid = cdids[i];
				var obj = {};
				var measureID ="";

				switch( cdid ){
					case "D7G7":
					measureID = "CPI";
					break;
					case "L55O":
					measureID = "CPIH";
					break;
					case "KVR9":
					measureID = "RPIJ";
					break;
					case "CDKQ":
					measureID = "RPIX";
					break;
					case "CZBH":
					measureID = "RPI";
					break;
				}

				if(measureID!==""){
					obj.last = parseFloat( lastValues.value[i],10);
					obj.diff = lastValues.value[i] - penultimateValues.value[i];
					tableObjects[measureID] = obj;

				}

			}

			seriesData = [];
			addSeries(MONTHLY);
			addSeries(QUARTERLY);
			addSeries(YEARLY);

			updateTable();

			setYears();

			populateChartData(MONTHLY);

			console.log(tableObjects);
		}


	function addSeries(interval){
		var i
		, j
		, month
		, year
		, mon
		, day = 1
		, timestamp
		, length
		, listLength
		, timeArray
		, year
		, mon
		, tempTitle
		, intervalTitle

		,startDate = []
		, endDate = [];

		
 		//reset chartdata
 		charts = [];
 		chartOptions = lineChart;
 		chartOptions.series =[];
 		chartOptions.tooltip.formatter = monthFormat;

 		chartOptions.yAxis.labels.formatter = normalFormat;

 		switch (interval) {
 			case MONTHLY:
 			timeArray = monthArray;

 			break;

 			case QUARTERLY:
 			timeArray = qtrArray;
 			break;

 			case YEARLY:
 			timeArray = yearArray;
 			break;
 		}

		// list length is the total number of data entries in the CSV
		listLength = timeArray.length;

		// timeArray of objects:
		// eg
		// {"date": "1973 APR", value:"["", "", "", "" ,"9.2", "", "", "", "", ""]"}
		// need to split into the individual CDID series

		// so loop through all the data entries
		// for each data row, loop through the series and build a separate list
		
        //split array objects {date, value} date into series data [array]
        for ( i = 0; i < listLength; i++) {
        	// create js date object and update the array with new timestamp
        	switch (interval) {

        		case MONTHLY:
        		year = parseInt(monthArray[i].date.split(" ")[0]);
        		month = monthArray[i].date.split(" ")[1] ;

        		switch (month) {
        			case "JAN":
        			mon = 0;
        			break
        			case "FEB":
        			mon = 1;
        			break
        			case "MAR":
        			mon = 2;
        			break
        			case "APR":
        			mon = 3;
        			break
        			case "MAY":
        			mon = 4;
        			break
        			case "JUN":
        			mon = 5;
        			break
        			case "JUL":
        			mon = 6;
        			break
        			case "AUG":
        			mon = 7;
        			break
        			case "SEP":
        			mon = 8;
        			break
        			case "OCT":
        			mon = 9;
        			break
        			case "NOV":
        			mon = 10;
        			break
        			case "DEC":
        			mon = 11;
        			break
        		}
        		break;

        		case QUARTERLY:
        		year = parseInt(qtrArray[i].date.split(" ")[0]);
        		month = qtrArray[i].date.split(" ")[1] ;

        		switch (month) {
        			case "Q1":
        			mon = 2;
        			break
        			case "Q2":
        			mon = 5;
        			break
        			case "Q3":
        			mon = 8;
        			break
        			case "Q4":
        			mon = 11;
        			break
        		}
        		break;

        		case YEARLY:
	        		year = parseInt(yearArray[i].date.split(" ")[0]);
	        		mon = 0;
        		break;
        	}


			// This is where the magic happens...
			// split out the CSV value into its data series

			if( !isNaN(year) ){
				timestamp = new Date(year, mon, day).getTime();
				var objArray =[];//create a data object with date and value
				objArray[0] = timestamp;// date
				objArray[1] = [];

				var length = timeArray[i].value.length;

				for ( var j=0;j<length;j++){
					
					if( timeArray[i].value[j] === ""){
						objArray[1][j] = null;
					}else{

						if(!startDate[j]){
							startDate[j] = timeArray[i].date;
						}

						objArray[1][j] = parseFloat(timeArray[i].value[j],10);// value


						// redefine the indices
						// id the id array is he first line of the csv, eg a list of the CDID's
						var idx = measureIndex[ id[j] ];

						if( !chartOptions.series[idx] ){
							chartOptions.series[idx]  = {};
						}

						// initialise series Data object
						if( !seriesData[idx] ){
							seriesData[idx] = {};
							seriesData[idx].name = formalTitles[ id[j] ];
							seriesData[idx].color = measureColours[ id[j] ];
							seriesData[idx].data_m = [];
							seriesData[idx].data_q = [];
							seriesData[idx].data_y = [];
						}
						//console.log(j + " baseValues[j]: "  + baseValues[j] );
						seriesData[idx].baseValue = baseValues[j];
							//console.log("baseValue: " + baseValues[j]);


						// instead of just adding series to the chart object, build separate index and percentage series in order:

						// NB The high chart library requires the data as an array of form [date in msUTC, value]
						//eg push an array of time and value
						switch (interval) {
							case MONTHLY:
							seriesData[idx].data_m.push( [ objArray[0], objArray [1][j] ] );
							seriesData[idx].start_m = parseInt(startDate[j].substr(0,4));
							seriesData[idx].end_m = parseInt(timeArray[i].date.substr(0,4));

							break;

							case QUARTERLY:
							seriesData[idx].data_q.push( [ objArray[0], objArray [1][j] ] );
							seriesData[idx].start_q = parseInt(startDate[j].substr(0,4));
							seriesData[idx].end_q = parseInt(timeArray[i].date.substr(0,4));
							break;

							case YEARLY:
							seriesData[idx].data_y.push( [ objArray[0], objArray [1][j] ] );
							seriesData[idx].start_y = parseInt(startDate[j].substr(0,4));
							seriesData[idx].end_y = parseInt(timeArray[i].date.substr(0,4));
							break;
						}
						
					}

				}

			}

		}

	}


	// loop through the raw data as all values are already assigned to a given date
	function getBaseYear(interval){
		var tempArray = [];
		var index;
		var numDataItems;
		baseValues = [];

		// set array based on the interval 
		switch (interval) {
 				case MONTHLY:
 				timeArray = monthArray;
 				numDataItems = 12;

 				break;

 				case QUARTERLY:
 				timeArray = qtrArray;
 				numDataItems = 4;
 				break;

 				case YEARLY:
 				timeArray = yearArray;
 				numDataItems = 1;
 				break;
 			}

		// list length is the total number of data entries in the CSV
		listLength = timeArray.length;

		for ( i = 0; i < listLength; i++) {

			switch (interval) {
				case MONTHLY:
					//find start point
					if(timeArray[i].date === baseYear + " JAN"){
						index = i;
					}
				break;

				case QUARTERLY:			
					//find start point	
					if(timeArray[i].date === baseYear + " Q1"){
						//console.log("match at " + i);
						index = i;
					}
				break;

				case YEARLY:
					if(timeArray[i].date === baseYear){
						//console.log("GOT LAST VALUE: "  + timeArray[i].value);
						index = i;
					}
				break;
			}
		}

		//check if all data are available
		for ( var j=0; j<numDataItems; j++){
			//console.log("length: "  + timeArray.length + ":" + (index+3));
			if(timeArray[index+j] && timeArray[index+j].date.indexOf(baseYear)>-1){
				//console.log("got a match year " + timeArray[index+j].date);
				tempArray.push(timeArray[index+j].value)
			}
		}

		// loop thought all the available data and sum it
		var len = tempArray.length;
		var numItems = tempArray[0].length;
		baseValues = [0,0,0,0,0,0,0,0,0,0];
		numValues = [0,0,0,0,0,0,0,0,0,0];

		// loop through each date
		for ( var j=0; j<len; j++){
			// sum each value
			for (var k=0; k<numItems; k++){
				var num = tempArray[j][k];
				if (num === ""){
					num = 0;
				}else{
					num = parseFloat( tempArray[j][k], 10 );
					numValues[k]++;
				}
				baseValues[k] += num;
			}
		}

		// loop through each value to calc mean
		for (var k=0; k<numItems; k++){
			if(numValues[k]>0){
				baseValues[k] = baseValues[k] / numValues[k];
			}
		}

		//assign base value to seriesData
		var length = baseValues.length;

		for ( var j=0;j<length;j++){
			var idx = measureIndex[ id[j] ];
			seriesData[idx].baseValue = baseValues[j];
		}
	}

	function updateTable(){
		var cpi_diff = tableObjects["CPI"].diff;
		var cpih_diff = tableObjects["CPIH"].diff;
		var rpij_diff = tableObjects["RPIJ"].diff;
		var rpi_diff = tableObjects["RPI"].diff;
		var rpix_diff = tableObjects["RPIX"].diff;
		var CPI_last = tableObjects["CPI"].last;
		var CPIH_last = tableObjects["CPIH"].last;
		var RPIJ_last = tableObjects["RPIJ"].last;
		var RPI_last = tableObjects["RPI"].last;
		var RPIX_last = tableObjects["RPIX"].last;

		var cpi_date = lastValues.date;
		var temp = cpi_date.split(" ");
		var mon = temp[1]; 
		var yr = temp[0];
		var displayMonth = mon.capitalise();
		var display = displayMonth +" " +yr;

		if(cpi_diff=== 0){
			cpi_diff = "unchanged";
			$("#CPI_change_icon").attr("src", "img/nochange-icon.png" );

		} else{
			if(cpi_diff>0){
				$("#CPI_change_icon").attr("src", "img/up-icon.png" );

			}else{
				$("#CPI_change_icon").attr("src", "img/down-icon.png" );
			}
			cpi_diff = cpi_diff.toFixed(1) + "%*";
		}


		if(cpih_diff=== 0){
			cpih_diff = "unchanged";
			$("#CPIH_change_icon").attr("src", "img/nochange-icon.png" );
		} else{
			if(cpih_diff>0){
				$("#CPI_change_icon").attr("src", "img/up-icon.png" );
			}else{
				$("#CPIH_change_icon").attr("src", "img/down-icon.png" );
			}
			cpih_diff = cpih_diff.toFixed(1) + "%*";
		}


		if(rpij_diff=== 0){
			rpij_diff = "unchanged";
			$("#RPIJ_change_icon").attr("src", "img/nochange-icon.png" );
		} else{
			if(rpij_diff>0){
				$("#RPIJ_change_icon").attr("src", "img/up-icon.png" );
			}else{
				$("#RPIJ_change_icon").attr("src", "img/down-icon.png" );
			}
			rpij_diff = rpij_diff.toFixed(1) + "%*";
		}


		if(rpi_diff=== 0){
			rpi_diff = "unchanged";
			$("#RPI_change_icon").attr("src", "img/nochange-icon.png" );
		} else{
			if(rpi_diff>0){
				$("#RPI_change_icon").attr("src", "img/up-icon.png" );
			}else{
				$("#RPI_change_icon").attr("src", "img/down-icon.png" );
			}
			rpi_diff = rpi_diff.toFixed(1) + "%*";
		}


		if(rpix_diff=== 0){
			rpix_diff = "unchanged";
			$("#RPIX_change_icon").attr("src", "img/nochange-icon.png" );
		} else{
			if(rpix_diff>0){
				$("#RPIX_change_icon").attr("src", "img/up-icon.png" );
			}else{
				$("#RPIX_change_icon").attr("src", "img/down-icon.png" );
			}
			rpix_diff = rpix_diff.toFixed(1) + "%*";
		}


		$("#CPI_rate").text(CPI_last.toFixed(1) + "%");
		$("#CPIH_rate").text(CPIH_last.toFixed(1) + "%");
		$("#RPIJ_rate").text(RPIJ_last.toFixed(1) + "%");
		$("#RPI_rate").text(RPI_last.toFixed(1) + "%");
		$("#RPIX_rate").text(RPIX_last.toFixed(1) + "%");


		$("#CPI_change").text(cpi_diff);
		$("#CPIH_change").text(cpih_diff );
		$("#RPIJ_change").text(rpij_diff);
		$("#RPI_change").text(rpi_diff);
		$("#RPIX_change").text(rpix_diff);


		$("#CPI_date").text(display);
		$("#CPIH_date").text(display );
		$("#RPIJ_date").text(display);
		$("#RPI_date").text(display);
		$("#RPIX_date").text(display);

	}




	function populateChartData(interval){
		var len =  seriesData.length;

		// set the base chart data
		// NB AS THE BASE DATA SETS ARE ARRAYS WE NEED TO DEEP CLONE THEM
		for ( var i=0; i<len;i++){
			seriesData[i].data = seriesData[i]["data_"+interval.toLowerCase()].slice(0);

			var length = seriesData[i].data.length;
			for ( var j=0; j<length;j++){
			seriesData[i].data[j] = seriesData[i].data[j].slice(0);
			}
		}

		if(baseYear){
			getBaseYear(interval);
		}

		for ( var i=0; i<len;i++){

			if(baseYear){
				var length = seriesData[i].data.length;
				var last = seriesData[i].baseValue;
				if(!last){
					last = 100;
				}

				for ( var j=0; j<length;j++){
					var num = 100 * seriesData[i].data[j][1]/last;
					num = Math.round(num*100)/100;
					seriesData[i].data[j][1] = ( num );
				}

			}
		}

		// example series Data.data = [1388534400000, 126.7]
		chartOptions.series = seriesData;

		var type = "Index";

		if( $('#unit1').attr('checked') ){
			type = "Index";
		}else{
			type = "Percentages";
		}

		chartOptions.yAxis.title.text = type;

			if(!isIE() || isIE()>9){
				drawChart();
				showSeries(type);
			}else{
				//console.log("is ie");
				drawTable();
			}
	}


	function drawChart () {
		if (chart){
			chart.destroy();
		}
		var w = null;
		var h = null;

		chartOptions.chart.height = h;
		chartOptions.chart.width = w;

		$("#chart").highcharts(chartOptions);
		chart = $("#chart").highcharts();

	}


	function drawTable() {
		$("#chart").empty();
		var notice = "<div class='alert'><h2>This browser cannot display the charts.</h2><p>You should upgrade your browser for security reasons.</p></div>"
		var table = "<table id='results'>";

		// main Measures
		var row = "<tr>"
		row+="<td></td>";
		row+="<th colspan='2'>CPI</th>";
		row+="<th colspan='2'>CPIH</th>";
		row+="<th colspan='2'>RPIJ</th>";
		row+="<th colspan='2'>RPI</th>";
		row+="<th colspan='2'>RPIX</th>";
		row += "</tr>"
		table += row;


		// Index or %
		row = "<tr>";
		row += "<th></th>";
		for ( i = 0; i <cdids.length; i++) {
			var copy = descriptions[i][1];
			if(copy.indexOf('Percentage')> 0){
				copy = "%";
			}else{
				copy = "Index";
			}
				row += "<th>" + copy + "</th>";
		}
		row += "</tr>";
		table+=row;


		// CDID
		row = "<tr>";
		row += "<th></th>";
		for ( i = 0; i <cdids.length; i++) {
			var newCDID = titleOrder[i];
			row += "<th>" + newCDID + "</th>";
		}
		row += "</tr>";
		table+=row;

		var length = yearArray.length;

		for (var i=0; i<length; i++){

			if(i%2===0){
				var row = "<tr class='alt'>";
			}else{
				var row = "<tr>";
			}
			
			var numCols = yearArray[i].value.length;
			row += "<th>" + yearArray[i].date + "</th>";

			for (var j=0; j<numCols; j++){
				var thisID = titleOrder[j];
				var idx = tableOrder[ thisID ] ;
				row += "<td>" + yearArray[i].value[idx] + "</td>";
			}
			row += "</tr>";
			table+=row;
		}

		// CDID
		row = "<tr>";
		row += "<th>CDID:</th>";
		for ( i = 0; i <cdids.length; i++) {
			var newCDID = titleOrder[i];
			row += "<th>" + newCDID + "</th>";
		}
		row += "</tr>";
		table+=row;

		$("#note").hide();
		$("#saveBtn").hide();
		$("#downloadBtn").show();
		
		$("#chart").append(notice);
		$("#chart").append(table);

		var ht = $("table#results").height();


		$("#chart").height(ht + 120);

	}


	/*
	so indices are: 0 - 4
	and percentage: 5 - 9 
	*/

	function showSeries(type){

		if(type==="Index"){

			if( $('#CPI').attr('checked') ){
				chart.series[0].show();
				chart.series[0].options.showInLegend = true;
			}else{
				chart.series[0].hide();
			}
			if( $('#CPIH').attr('checked') ){
				chart.series[1].show();
				chart.series[1].options.showInLegend = true;
			}else{
				chart.series[1].hide();
			}
			if( $('#RPIJ').attr('checked') ){
				chart.series[2].show();
				chart.series[2].options.showInLegend = true;
			}else{
				chart.series[2].hide();
			}
			if( $('#RPI').attr('checked') ){
				chart.series[3].show();
				chart.series[3].options.showInLegend = true;
			}else{
				chart.series[3].hide();
			}
			if( $('#RPIX').attr('checked') ){
				chart.series[4].show();
				chart.series[4].options.showInLegend = true;
			}else{
				chart.series[4].hide();
			}


			for ( var i=5; i<10; i++){
				var item = chart.series[i];
				item.hide();
				item.options.showInLegend = false;
				item.legendItem = null;
				chart.legend.destroyItem(item);
			}

		}else{

			for ( var i=0; i<5; i++){
				var item = chart.series[i];
				item.hide();
				item.options.showInLegend = false;
				item.legendItem = null;
				chart.legend.destroyItem(item);
			}


			if( $('#CPI').attr('checked') ){
				chart.series[5].show();
				chart.series[5].options.showInLegend = true;
			}else{
				chart.series[5].hide();
			}

			if( $('#CPIH').attr('checked') ){
				chart.series[6].show();
				chart.series[6].options.showInLegend = true;
			}else{
				chart.series[6].hide();
			}
			if( $('#RPIJ').attr('checked') ){
				chart.series[7].show();
				chart.series[7].options.showInLegend = true;
			}else{
				chart.series[7].hide();
			}

			if( $('#RPI').attr('checked') ){
				chart.series[8].show();
				chart.series[8].options.showInLegend = true;
			}else{
				chart.series[8].hide();
			}

			if( $('#RPIX').attr('checked') ){
				chart.series[9].show();
				chart.series[9].options.showInLegend = true;
			}else{
				chart.series[9].hide();
			}

		}
		chart.legend.render();

	}


	function setYears(){

		var startPoint = 1900;
		var endPoint;
		var html = "";

		var frequency =  $('[id^="freq"]:checked').val().toLowerCase();
		//console.log("freq " + frequency);

		var checklist = new Array();
		$('#example_list input:checked').each(function() {
		    checklist.push( parseInt( $(this).attr('name') ) );
		});

		for (i in checklist){
			//loop through each checklist and get the start date
			var id = checklist[i]
			var item = seriesData[id];
				endPoint = item["end_"+frequency];
				//get the largest value
				startPoint = Math.max(startPoint, item["start_"+frequency]);
		}
		
		html = "<option>Select baseline date*</option>";

		for ( var i = endPoint; i>=startPoint; i--){
																
			html += "<option value='" + i + "'>" + i + "</option>";
		}

		var select = $('#dateSelect');
		select.empty().append(html);
	}


	//NB the visible property is the current one which is then toggled
	function adjustCheckBoxes(name, currentVis){
		var vis = !currentVis;
		$("#"+name).attr("checked", vis);
	}

	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	}


	$(document).ready(function() {

		$('a.infoBtn').click( function(e){
			e.preventDefault();
		});

		$('a#saveChart').click( function(e){
			e.preventDefault();

			chart.exportChart(null, {
				chart:{
					width:1024
					, height:768
				}
			});
		});

		$('a#updateChart').click( function(e){
			e.preventDefault();

			// get the data series
			var frequency =  $('[id^="freq"]:checked').val();
			populateChartData( frequency );

			// show and hide series
			// (toggle depending on indices or percent)

			$( "input:checkbox:checked" ).each(function( index ) {

				var percentageAdjust = 0;
				if( ! $('#unit1').attr('checked') ){
					percentageAdjust = 5;
				}
				var idx = parseInt( this.name, 10);
				idx = idx + percentageAdjust;
				var series = chart.series[idx];
				series.show();
			});


			$( "input:checkbox:not(:checked)" ).each(function( index ) {
				var percentageAdjust = 0;

				if( !$('#unit1').attr('checked') ){
					percentageAdjust = 5;
				}
				var idx = parseInt( this.name, 10);
				idx = idx + percentageAdjust;

				var series = chart.series[idx];
				series.hide();
			});

		});


		$('a.custom').click( function(e){
			e.preventDefault();

			var list = "";
			$( "input:checkbox:checked" ).each(function( index ) {

				switch( this.id ){
					case "CPI":
					list+= "D7BT,D7G7,";
					break;
					case "CPIH":
					list+= "L522,L55O,";
					break;
					case "RPIJ":
					list+= "KVR8,KVR9,";
					break;
					case "RPI":
					list+= "CHAW,CZBH,";
					break;
					case "RPIX":
					list+= "CHMK,CDKQ,";
					break;
				}

			});

			list = list.substring(0, list.length - 1);
			var url = DOWNLOAD_URL + list;

			window.open(url, '_blank');
		});



		$(".info").mouseover(function(e){
			//get id 
			var num = $(this).attr("id").substring(4);
			var id = parseInt( num )  - 1;

			$("#title").text(titles[id]);
			if(id>2){
				$("#national").text("Not a National Statistic");
				$("#natStat").hide();
			}else{
				$("#national").text("National Statistic");
				$("#natStat").show();
			}
			$("#tooltip").css({ top: $( this ).position().top -50});
			$("#tooltip").css({ left: $( this ).position().left + 50});
			$("div#tooltip").show();
		});

		$(".info").mouseout(function(e){
			$("div#tooltip").hide();
		});

		$menu = $("select.dateSelect");

		$menu.change(function(){
			baseYear = this.value.toLowerCase();
		}); 


		$('input[type=radio]').click(function(){
			if (this.id == "unit1" || this.id == "unit2" )
				//console.log(this.value);
			if(this.value === "index"){
				$('#dateSelect').attr('disabled', false);
			}else{
				if(this.value === "percent"){
					$('#dateSelect').attr('disabled', true);
					baseYear = "";
				}
			}
		});


		$( "input:checkbox:checked" ).change(function(){
			//console.log("changes...")
			setYears();
		})

		$( "[id^='freq']" ).change(function(){
			//console.log("radio ch,ch,changes...")
			setYears();
		})

		var status=$('input:radio[name="Units"]:checked').val();
		if( status === 'percent' ){
			$('#dateSelect').attr('disabled', true);
		}
		units = "";

		$("#downloadBtn").hide();

		getData( INITIAL_LIST );
	});


}(jQuery));	
