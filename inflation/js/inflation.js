var inflation = (function($) {
	var model = {}

	// location of csv data and also page containing update date


	// static version using local data snapshot
	, BASE_URL = "data/" 


	//, BASE_URL = "proxy_dataset.php"
	, UPDATE_URL = "data-selector.html"
	, DOWNLOAD_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv?dataset=mm23&cdid="
	, INITIAL_LIST = ['D7G7','D7BT','L522','L55O','KVR8','KVR9','CHAW','CZBH','CHMK','CDKQ']
	, indices = ["D7BT", "L522", "KVR8", "CHAW", "CHMK"]

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
	, yearArray
	, qtrArray
	, monthArray

	, seriesData = []
	, descriptions = []
	, cdids =[]

	, colours = ["#003D57","#A8BD3A","#C5000B","#90B0C9","#FF950E","#7E0021","#FF420E","#314004","#FFD320", "#000000"]
	, monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
	, chartOptions

	, $menu
	, baseYear
	, baseValue = []

	, loadedItems = 0


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



	function getData(list){

		var cdid;

		for ( var i=0; i<list.length; i++){
			cdid = list[i];


			$.ajax({
				dataType: "json",
				url: BASE_URL+ cdid + ".json",
				success: function(data) {
					storeData(data);
				},
				error: function (xhr, textStatus, errorThrown) {
					console.warn("error");
					//console.log(xhr);
				}
			});
		}
	}




	/////////////////////////////////////////////////////////////////////////////////////////
	//
	//	Store the JSON in a central modeland split out any data for display:
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
	// 	m, q, and y 	- objects for month, quarter and year data start and end, used for displaying baseline years 
	//	name 			- series name from CSV
	//	visible	 		- is chart line visible
	//	}
	//
	/////////////////////////////////////////////////////////////////////////////////////////
	function storeData(json){

		var data = json;

		if(!model[data.cdid]){
			model[data.cdid] = json;
		}

		//calculate the change
		var numMonths = model[data.cdid].months.length;

		var latest = parseFloat(data.number);
		var last = parseFloat(data.months[numMonths-1].value);
		if( isNaN(latest) ){
			latest = last;
			last = parseFloat(data.months[numMonths-2].value);
			//also update date
			model[data.cdid].date = data.months[numMonths-1].month + " " + data.months[numMonths-1].year;
			//console.log(data.cdid + ": " + model[data.cdid].date);
		}

		var diff = latest - last;
		model[data.cdid].diff = diff;
		model[data.cdid].latest = latest;

		var measure = data.name.split(":")[0];
		if(data.unit ==="%" && measure.indexOf("%")===-1){
			//console.log(data.cdid + " %" + measure);
			measure += " (% change)";
		}
		model[data.cdid].title = measure;

		model[data.cdid].data_mon = addSeries(MONTHLY, data.cdid);
		model[data.cdid].data_qtr = addSeries(QUARTERLY, data.cdid);
		model[data.cdid].data_yr = addSeries(YEARLY, data.cdid);

		//use jquery to find the start and end years for each frequncy (used in baseline)
		model[data.cdid].M = {};
		model[data.cdid].M.start = Math.min.apply(Math, model[data.cdid].months.map(function(o){return o.year;}));
		model[data.cdid].M.end = Math.max.apply(Math, model[data.cdid].months.map(function(o){return o.year;}));

		model[data.cdid].Q = {};
		model[data.cdid].Q.start = Math.min.apply(Math, model[data.cdid].quarters.map(function(o){return o.year;}));
		model[data.cdid].Q.end = Math.max.apply(Math, model[data.cdid].quarters.map(function(o){return o.year;}));

		model[data.cdid].Y = {};
		model[data.cdid].Y.start = Math.min.apply(Math, model[data.cdid].years.map(function(o){return o.year;}));
		model[data.cdid].Y.end = Math.max.apply(Math, model[data.cdid].years.map(function(o){return o.year;}));

		data = null;
		loadedItems++;

		if(loadedItems === INITIAL_LIST.length){
			init();
		}
	}






	function addSeries(interval, cdid){
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
		, intervalTitle;

		var timeSeries = [];

		

 		switch (interval) {
 			case MONTHLY:
 			timeArray = model[cdid].months;
 			break;

 			case QUARTERLY:
 			timeArray = model[cdid].quarters;
 			break;

 			case YEARLY:
 			timeArray = model[cdid].years;
 			break;
 		}

		// list length is the total number of data entries in the JSON
		listLength = timeArray.length;

		// timeArray of objects:
		// eg
		/*
		    {
		      "date": "2014 AUG",
		      "value": "128.3",
		      "year": "2014",
		      "month": "August",
		      "sourceDataset": "MM23"
		    }
		*/
		// 
		// need to split an array of arrays with the time and value for each data point
		// eg [date in msUTC, value]
		// so loop through all the data entries
		// for each data row, and build a separate list of the formatted data
		
        //split array objects {date, value} date into series data [array]
        for ( i = 0; i < listLength; i++) {
        	// create js date object and update the array with new timestamp
        	switch (interval) {

        		case MONTHLY:
        		year = parseInt(timeArray[i].year);
        		month = timeArray[i].month ;

        		switch (month) {
        			case "January":
        			mon = 0;
        			break
        			case "February":
        			mon = 1;
        			break
        			case "March":
        			mon = 2;
        			break
        			case "April":
        			mon = 3;
        			break
        			case "May":
        			mon = 4;
        			break
        			case "June":
        			mon = 5;
        			break
        			case "July":
        			mon = 6;
        			break
        			case "August":
        			mon = 7;
        			break
        			case "September":
        			mon = 8;
        			break
        			case "October":
        			mon = 9;
        			break
        			case "November":
        			mon = 10;
        			break
        			case "December":
        			mon = 11;
        			break
        		}
        		break;

        		case QUARTERLY:
        		year = parseInt(timeArray[i].year);
        		month = timeArray[i].quarter ;

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
	        		year = parseInt(timeArray[i].year);
	        		mon = 0;
        		break;
        	}

			// This is where the magic happens...
			// split out the CSV value into its data series

			if( !isNaN(year) ){
				timestamp = new Date(year, mon, day).getTime();

    			var dataPoint =[];			//create a blank array for each data object with time and value
				dataPoint[0] = timestamp;	// date
				dataPoint[1] = parseFloat(timeArray[i].value);
				timeSeries.push(dataPoint);
			}

		}
		return timeSeries

	}


	// get the average value for the selected year, set the year to 100 and re-index all values
	function getBaseYear(interval){
		var tempArray = [];
		var dataArray = [];
		var index;
		var numDataItems;
		var suffix = "";
		var baseValue = [];

		var itemLen = indices.length;

		for ( var i = 0; i<itemLen; i++){
			tempArray = [];

			var cdid = indices[i];

			// set array based on the interval 
			switch (interval) {
				case MONTHLY:
				timeArray = model[cdid].months;
				dataArray = model[cdid].data_mon;
				numDataItems = 12;
				suffix = " JAN";
				break;

				case QUARTERLY:
				timeArray = model[cdid].quarters;
				dataArray = model[cdid].data_qtr;
				numDataItems = 4;
				suffix = " Q1";
				break;

				case YEARLY:
				timeArray = model[cdid].years;
				dataArray = model[cdid].data_yr;
				numDataItems = 1;
				break;
			}


			// list length is the total number of data entries in the CSV
			listLength = timeArray.length;

			// loop thru ALL the dates and find matching year
			for ( j = 0; j < listLength; j++) {

				//find start point
				if(timeArray[j].date === baseYear + suffix){
					index = j;
				}

			}
			
			// get the average of the values for the selected year

			// add all the available values into temp array
			for ( var j=0; j<numDataItems; j++){
				//console.log("length: "  + timeArray.length + ":" + (index+3));
				if(timeArray[index+j] && timeArray[index+j].date.indexOf(baseYear)>-1){
					tempArray.push( parseFloat(timeArray[index+j].value) );
				}
			}
			var len = tempArray.length;
			var sum = 0;
			for( var j = 0; j < len; j++ ){
			    sum += tempArray[j];
			}

			var avg = sum/len;


			// loop thru ALL the dates AGAIN and calculate the re-indexed values
			listLength = dataArray.length;
			model[cdid].baseValue = [];
			for ( j = 0; j < listLength; j++) {
				var num = 100 * parseFloat(timeArray[j].value) / avg;
				num = Math.round(num*100)/100;
				model[cdid].baseValue[j] = [dataArray[j][0], num];
			}

		}

	}



	function updateTable(){
		var cpi_diff = model["D7G7"].diff;
		var cpih_diff = model["L55O"].diff;
		var rpij_diff = model["KVR9"].diff;
		var rpi_diff = model["CZBH"].diff;
		var rpix_diff = model["CDKQ"].diff;

		var CPI_last = model["D7G7"].latest;
		var CPIH_last = model["L55O"].latest;
		var RPIJ_last = model["KVR9"].latest;
		var RPI_last = model["CZBH"].latest;
		var RPIX_last = model["CDKQ"].latest;

		var CPI_date = model["D7G7"].date;
		var CPIH_date = model["L55O"].date;
		var RPIJ_date = model["KVR9"].date;
		var RPI_date = model["CZBH"].date;
		var RPIX_date = model["CDKQ"].date;

		var display =  model["D7BT"].date;
		$("#last_date").text("Last updated: " + display);

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


		$("#CPI_date").text(CPI_date);
		$("#CPIH_date").text(CPIH_date );
		$("#RPIJ_date").text(RPIJ_date);
		$("#RPI_date").text(RPI_date);
		$("#RPIX_date").text(RPIX_date);

	}




	function populateChartData(interval){

		var len =  INITIAL_LIST.length;

		if(baseYear){
			getBaseYear(interval);
		}

		// loop through each measure and build series data
		// start with monthly
		for (var item in model){
			//use the measure as an index to order the sereis data into indices and percentages in a consistent order
			var idx = measureIndex[item];

			seriesData[idx] = [];
			var obj =[];
			obj.name = model[item].title;
			obj.color = measureColours[ item ];

			switch (interval) {
				case MONTHLY:
					obj.data = model[item].data_mon;
				break;
				case QUARTERLY:			
					obj.data = model[item].data_qtr;
				break;
				case YEARLY:
					obj.data = model[item].data_yr;
				break;
			}

			if(baseYear){
				obj.data = model[item].baseValue;
			}

			seriesData[idx] = obj;

		}

		// example series Data.data = [1388534400000, 126.7] - eg the time in milliseconds and tehn the value for each point
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

		  
	// display available years in a drop down list for baseline
	function setYears(){

		var startPoint = 1900;
		var endPoint;
		var html = "";


		var frequency =  $('[id^="freq"]:checked').val().toUpperCase();

		var checklist = new Array();
		$('#example_list input:checked').each(function() {
		    checklist.push( parseInt( $(this).attr('name') ) );
		});

		for (i in checklist){
			//loop through each checklist and get the start date
			var id = checklist[i]
			var cdid = indices[id];

			var item = model[cdid][frequency];
			endPoint = item.end;
			//get the largest value
			startPoint = Math.max(startPoint, item.start);
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



	function init(arguments) {
		//reset chartdata
 		charts = [];
 		chartOptions = lineChart;
 		chartOptions.series =[];
 		chartOptions.tooltip.formatter = monthFormat;
 		chartOptions.yAxis.labels.formatter = normalFormat;

		updateTable();
		setYears();
		populateChartData(MONTHLY);

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
			setYears();
		})

		$( "[id^='freq']" ).change(function(){
			setYears();
		})

		var status=$('input:radio[name="Units"]:checked').val();
		if( status === 'percent' ){
			$('#dateSelect').attr('disabled', true);
		}

		$("#downloadBtn").hide();

	
		getData( INITIAL_LIST );


	});


}(jQuery));	
