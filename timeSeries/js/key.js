//--------------------------------------------------------------------------
//
//   
//
//--------------------------------------------------------------------------

var keys = (function($, undefined){

    // URL used in on-page links to data (Download CSV)
    var DOWNLOAD_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv";
    //var DOWNLOAD_URL = "http://wasppreview/ons/datasets-and-tables/downloads/csv.csv";

    // URL used in on-page links to ONS data page (Series name in first column of table)
    var DATA_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/data-selector.html";

    // URL for Chart data download (Needs proxy except on live)
    var ONS_CDID_URL = DOWNLOAD_URL;
    var ONS_CDID_URL = "proxy_dataset.php";




    var 
	  MONTHLY = "M"    //"monthly"
	, QUARTERLY = "Q"  //"quarterly"
	, YEARLY = "Y"     //"yearly"
	, GDP_Flag = 3
	, GDPName = [null, "Preliminary Estimate", "Secondary Estimate", "Quarterly National Accounts"]
	, dataset
	, chart
	, rawData
	, yearArray
	, qtrArray
	, monthArray
	, descriptions 
	, colours= ["#003D57","#A8BD3A","#C5000B","#90B0C9","#FF950E","#7E0021","#FF420E","#314004","#FFD320", "#000000"]
	, chartOptions
	, chartTitle
	, chartIsInited = false
	, units
	, customInterval = {}

	, defaultTitle = ""
	, defaultSubTitle = ""

	, titleObj = 
        {
		text: defaultTitle
		, style: 
            {
                fontFamily: 'Open Sans'
                , color: '#333'
            }
        }

    , subTitleObj = {
    	text: defaultSubTitle
    	, style: {
    		fontFamily: 'Open Sans'
    		, color: '#333'
    	}
    }
    , itemStyleObj ={
    	fontFamily: 'Open Sans'
    	, color: '#333'
    }
    , xAxisStyleObj = {
    	fontFamily: 'Open Sans'
    	, color: '#333'
    	, fontSize : '12px'
    }
    , yAxisStyleObj = {
    	fontFamily: 'Open Sans'
    	, color: '#333'
    	, fontSize : '12px'
    	, fontWeight: 'normal'
    }

    , lineChart={
        chart: {
            renderTo: 'chart',
            type: 'line',
            width: 600,
            height: 300
        },
        title: titleObj,
        subtitle: subTitleObj,
        xAxis: {
            title: {
                text: '',
                style: xAxisStyleObj
            },
            type: 'datetime',
            labels: {
                style: xAxisStyleObj,
                y: 25
            }
        },
        yAxis: {
            title: {
                text: '',
                align: 'high',
                style: yAxisStyleObj
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ],
            labels: {
                style: yAxisStyleObj,
                x: -20
            }
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false
                }
            }
        },
        tooltip: {
            formatter: function () {
                var s = '<b>',
                d = new Date(this.point.category),
                q = Math.floor((d.getMonth() + 3) / 3); //get quarter

                s = "Q" + q ;
                s = s + " " + Highcharts.dateFormat('%Y', this.x) + '</b>';
                s += '<br/>' + this.point.series.name + ': ';
                s += this.point.y;
                return s;
              }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: true
        }
    };


	// SET CUSTOM TIME INTERVAL
	// INFLATION
	customInterval["D7BT"] = MONTHLY;
	customInterval["D7G7"] = MONTHLY;
	customInterval["L522"] = MONTHLY;
	customInterval["L550"] = MONTHLY;
	customInterval["CHAW"] = MONTHLY;
	customInterval["CZBH"] = MONTHLY;
	customInterval["CHMK"] = MONTHLY;
	customInterval["CDKQ"] = MONTHLY;
	customInterval["KVR8"] = MONTHLY;
	customInterval["JVZ7"] = MONTHLY;
	customInterval["K646"] = MONTHLY;
	// LABOUR MARKET
	customInterval["KAI9"] = MONTHLY;
	customInterval["KAC3"] = MONTHLY;
	customInterval["MGRZ"] = MONTHLY;
	customInterval["MGSB"] = MONTHLY;
	customInterval["MGSA"] = MONTHLY;
	customInterval["LF24"] = MONTHLY;
	customInterval["LF25"] = MONTHLY;
	customInterval["MGSV"] = MONTHLY;
	customInterval["MGSC"] = MONTHLY;
	customInterval["MGSD"] = MONTHLY;
	customInterval["MGSX"] = MONTHLY;
	customInterval["MGSZ"] = MONTHLY;
	customInterval["MGSY"] = MONTHLY;
	customInterval["LF2M"] = MONTHLY;
	customInterval["LF2S"] = MONTHLY;
	customInterval["BCJD"] = MONTHLY;

	customInterval["A4YM"] = QUARTERLY;
	customInterval["LNNN"] = QUARTERLY;
	customInterval["LZVB"] = QUARTERLY;

	// set quarterly for Public sector 
	customInterval["ANNX"] = YEARLY;
	customInterval["RUTN"] = YEARLY;
	customInterval["RUTO"] = YEARLY;
	customInterval["HF6W"] = YEARLY;
	customInterval["HF6X"] = YEARLY;

	customInterval["YBHA"] = YEARLY;


	//formatter function for different tooltips
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var monthFormat = function () {
		var s = '<b>',
		d = new Date(this.point.category),
		s =  monthNames[d.getMonth()] + " " + Highcharts.dateFormat('%Y', this.x) + '</b>';
		s += '<br/>' + this.point.series.name + ': ';
		s += this.point.y;
		return s;
	};

	var qtrFormat = function () {
		var s = '<b>',
		d = new Date(this.point.category),
        q = Math.floor((d.getMonth() + 3) / 3); //get quarter

        s = "Q" + q ;
        s = s + " " + Highcharts.dateFormat('%Y', this.x) + '</b>';
        s += '<br/>' + this.point.series.name + ': ';
        s += this.point.y;
        return s;
    };

    var yearFormat = function () {
        var s = '<b>',
        s = Highcharts.dateFormat('%Y', this.x) + '</b>';
        s += '<br/>' + this.point.series.name + ': ';
        s += this.point.y;
        return s;
    };

    var millionFormat = function(){
        return Highcharts.numberFormat(this.value, 0, '');
    }

    var normalFormat = function(){
        return this.value;
    }


	// function to call ons website with actual CDIDs
	function getData(ref){
    	var cdid = ref
    	, url = "blank"

    	$.ajax({
    		dataType: "text",
    		url: ONS_CDID_URL,
    		data: "dataset=" + dataset + "&cdid=" + cdid,
    		success: function(data) {

    			rawData = data.split("\n");

    			splitRawData();
    		},
    		error: function (xhr, textStatus, errorThrown) {
                   //console.log("error");

                 }
       });
    }


    function splitRawData(){
    	var i
    	, j
    	, listLength = rawData.length
    	, valueList = rawData[0].split(",")
    	, numValues = valueList.length - 1
    	, isDirty = false;


    	yearArray  = [];
    	qtrArray   = [];
    	monthArray = [];
    	descriptions = [];

    	if(rawData[0].indexOf("\r")>-1){
    		isDirty = true;
    	}

    	for ( i = 0; i < listLength; i++) {

    		//rawData[i] = rawData[i].split("\r").join("");
    		rawData[i] = rawData[i].split(",");
    		if(isDirty){

    				rawData[i][0] = "\"" + rawData[i][0].split("\r").join("") +"\"";
    			
    			if(rawData[i][1]){
    				rawData[i][1] =  rawData[i][1].split("\r").join("");

    				if(rawData[i][1]===""){
    					rawData[i][1] = "0";
    				}
    			}
    		}

    		if(rawData[i][0]){
    			var dateLength = rawData[i][0].length;

				if(dateLength===6){						// YEAR
					var date = rawData[i][0].substr(1,4)
					yearArray.push( {date:date, value:rawData[i].slice(1)} );

				} else if (dateLength===9){	// QUARTER
					var date = rawData[i][0].substr(1,7);
					qtrArray.push( {date:date, value:rawData[i].slice(1)} );

				}else if (dateLength>9){							// MONTH
					var date = rawData[i][0].substr(1,8);
					monthArray.push( {date:date, value:rawData[i].slice(1)} );
				}

			}

		}

		title ="<br/>";


			//loop through the titles to correct for commas in the text...
			for ( i = 1; i <=numValues; i++) {
				var line = listLength - (i*5) - 1;
			if(rawData.length>2){
				var tempData = [];
				tempData[0] = rawData[line][0];
				rawData[line].shift();
				tempData[1] = rawData[line].join(", ");
				rawData[line]  = tempData;
			}

			if(isDirty){
				rawData[line][0] = rawData[line][0].split("\"").join("");
			}else{
				rawData[line][1] = rawData[line][1].split("\"")[1];
				
			}

			descriptions.push( rawData[line] );
		}

		populateChartData();

	}


    function populateChartData(){
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
		, interval
		, intervalTitle;

 		//reset chartdata
 		charts = [];
 		tempTitle = descriptions[0][1]; // eg get title from "YBHA,'Gross Domestic Product at market prices: Current price: Seasonally adjusted'"

 		// split the string and replace encoded code with £ symbol
 		var x = encodeURIComponent(tempTitle);
 		x = x.split("%EF%BF%BD").join("£");
 		tempTitle = decodeURIComponent(x);


 		chartOptions = lineChart;

 		chartOptions.series =[{
 			name: chartTitle,
 			data: []
 		}];

 		chartOptions.yAxis.title.text = units;

 		if(units==="£ million"){
 			chartOptions.yAxis.labels.formatter = millionFormat;
 		}else{
 			chartOptions.yAxis.labels.formatter = normalFormat;

 		}

 		interval = customInterval[ descriptions[0][0] ]

 		// check for overwritten time intervals
 		if( interval === MONTHLY ){
 			timeArray = monthArray;
 			intervalTitle = "Monthly Data: ";
 			chartOptions.tooltip.formatter = monthFormat;
 		}else if(interval === QUARTERLY ){ 
 			timeArray = qtrArray;
 			intervalTitle = "Quarterly Data: ";
 			chartOptions.tooltip.formatter = qtrFormat;

 		}else if( interval === YEARLY ){
 			timeArray = yearArray;
 			intervalTitle = "Yearly Data: ";
 			chartOptions.tooltip.formatter = yearFormat;
 			// step through MONTHLY; quarterly and yearly values and display highest if available
 		}else if( monthArray.length>1 ){
 			timeArray = monthArray;
 			interval = MONTHLY;
 			intervalTitle = "Monthly Data: ";
 			chartOptions.tooltip.formatter = monthFormat;
 		}else if( qtrArray.length>1 ){ 
 			timeArray = qtrArray;
 			interval = QUARTERLY;
 			intervalTitle = "Quarterly Data: ";
 			chartOptions.tooltip.formatter = qtrFormat;
 		}else if( yearArray.length>1 ){
 			timeArray = yearArray;
 			interval = YEARLY;
 			intervalTitle = "Yearly Data: ";
 			chartOptions.tooltip.formatter = yearFormat;
 		}else{
            console.log("Oops, something went wrong.");

 		}

 		chartOptions.title.text = intervalTitle + tempTitle;
 		listLength = timeArray.length;

 		// build the data series using the specific time interval

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

        	if( !isNaN(year) ){
        		timestamp = new Date(year, mon, day).getTime();

					var objArray =[];//create a data object with date and value
					objArray[0] = timestamp;// date
					objArray[1] = parseFloat(timeArray[i].value,10);// value
					chartOptions.series[0].data.push( objArray );
				}
			}

			year = parseInt(timeArray[0].date.split(" ")[0]);
			month = timeArray[0].date.split(" ")[1] ;
			mon = 0;

			chartOptions.series[0].pointInterval = 24 * 3600 * 1000 * 90;
			chartOptions.series[0].pointStart =  Date.UTC(year, mon, 01);

			drawChart();
		}


		function drawChart () {
			$("div#content").empty();
			$("div#content").append("<div id='chart' >");
			chartOptions.chart.height = 300;
			chart = $("div#chart").highcharts(chartOptions);
			modal.open({content: chart });
		}


		var modal = (function(){
			var 
			method = {},
			$overlay,
			$modal,
			$content,
			$close;

				// Center the modal in the viewport
				method.center = function () {
					var top, left;

					top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
					left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

					$modal.css({
						top:top + $(window).scrollTop(), 
						left:left + $(window).scrollLeft()
					});

				};


				// Open the modal
				method.open = function (settings) {
					$content.empty().append(settings.content);

					$modal.css({
						width: settings.width || 'auto', 
						height: settings.height || 'auto'
					});

					$content.css({
						width: settings.width-40 || 'auto', 
						height: settings.height-40 || 'auto'
					});

					method.center();
					$(window).bind('resize.modal', method.center);
					$modal.show();
					$overlay.show();
				};

				// Close the modal
				method.close = function () {
					$modal.hide();
					$overlay.hide();
					$content.empty();
					$(window).unbind('resize.modal');
				};

				// Generate the HTML and add it to the document
				$overlay = $('<div id="overlay"></div>');
				$modal = $('<div id="modal"></div>');
				$content = $('<div id="content"></div>');
				$close = $('<a id="close" href="#">close</a>');
				
				$modal.hide();
				$overlay.hide();
				$modal.append($content, $close);

				$(document).ready(function(){
					$('body').append($overlay, $modal);						
				});

				$close.click(function(e){
					e.preventDefault();
					method.close();
				});

				return method;
			}());


    function updateGDP(flag){
    	var url;
    	var alt_url;
    	var alt_dataset;

    	switch(GDP_Flag){
    		case 1:
                dataset = "qna";
                alt_dataset = "pgdp";

                $(".release").text("Preliminary Estimate");
                $(".release").attr("href", "http://www.ons.gov.uk/ons/rel/gva/gross-domestic-product--preliminary-estimate/index.html");
                $(".releaseQtr").text("Quarterly National Accounts");
                $(".releaseQtr").attr("href", "http://www.ons.gov.uk/ons/rel/naa2/quarterly-national-accounts/index.html");

                url = DOWNLOAD_URL + "?dataset=" + dataset +"&cdid=";
                alt_url = DOWNLOAD_URL + "?dataset=" + "pgdp" +"&cdid=";
    		break;


    		case 2:
                dataset = "pn2";
                alt_dataset = "pn2";

                // NB alt url is the same for second estimate
                url = DOWNLOAD_URL + "?dataset=" + dataset +"&cdid=";
                alt_url = DOWNLOAD_URL + "?dataset=" + dataset +"&cdid=";

                $(".release").text("Second Estimate of GDP");
                $(".release").attr("href", "http://www.ons.gov.uk/ons/rel/naa2/second-estimate-of-gdp/index.html");
                $(".releaseQtr").text("Second Estimate of GDP");
                $(".releaseQtr").attr("href", "http://www.ons.gov.uk/ons/rel/naa2/second-estimate-of-gdp/index.html");
			break;


			case 3:
                dataset = "qna";
                alt_dataset = "qna";

                // NB alt url is the same for quarterly accounts
                url = DOWNLOAD_URL + "?dataset=" + dataset +"&cdid=";
                alt_url = DOWNLOAD_URL + "?dataset=" + dataset +"&cdid=";

                $(".release").text("Quarterly National Accounts");
                $(".release").attr("href", "http://www.ons.gov.uk/ons/rel/naa2/quarterly-national-accounts/index.html");
                $(".releaseQtr").text("Quarterly National Accounts");
                $(".releaseQtr").attr("href", "http://www.ons.gov.uk/ons/rel/naa2/quarterly-national-accounts/index.html");
			break;
		}


		// ALT - PGDP
		$("#ABMI_table").attr("href", DATA_URL + "?cdid=ABMI&dataset=" + alt_dataset + "&table-id=A2");
		$("#ABMI_csv").attr("href", alt_url + "ABMI");
		$("#IHYQ_table").attr("href", DATA_URL + "?cdid=IHYQ&dataset=" + alt_dataset + "&table-id=A1");
		$("#IHYQ_csv").attr("href", alt_url + "IHYQ");
		$("#IHYR_table").attr("href", DATA_URL + "?cdid=IHYR&dataset=" + alt_dataset + "&table-id=A1");
		$("#IHYR_csv").attr("href", alt_url + "IHYR");
		// MAIN - QNA
		$("#YBHA_table").attr("href", DATA_URL + "?cdid=YBHA&dataset=" + dataset + "&table-id=A1");
		$("#YBHA_csv").attr("href", url + "YBHA");
		$("#IHYN_table").attr("href", DATA_URL + "?cdid=IHYN&dataset=" + dataset + "&table-id=A1");
		$("#IHYN_csv").attr("href", url + "IHYN");
		$("#IHYO_table").attr("href", DATA_URL + "?cdid=IHYO&dataset=" + dataset + "&table-id=A1");
		$("#IHYO_csv").attr("href", url + "IHYO");
		// ALT - PGDP
		$("#L2KQ_table").attr("href", DATA_URL + "?cdid=L2KQ&dataset=" + alt_dataset + "&table-id=B1");
		$("#L2KQ_csv").attr("href", alt_url + "L2KQ");
		$("#L2N8_table").attr("href", DATA_URL + "?cdid=L2N8&dataset=" + alt_dataset + "&table-id=B1");
		$("#L2N8_csv").attr("href", alt_url + "L2N8");
		$("#L2NC_table").attr("href", DATA_URL + "?cdid=L2NC&dataset=" + alt_dataset + "&table-id=B1");
		$("#L2NC_csv").attr("href", alt_url + "L2NC");
		// MAIN -  QNA
		$("#DTWM_table").attr("href", DATA_URL + "?cdid=DTWM&dataset=" + dataset + "&table-id=D");
		$("#DTWM_csv").attr("href", url + "DTWM");
		$("#CGBZ_table").attr("href", DATA_URL + "?cdid=CGBZ&dataset=" + dataset + "&table-id=D");
		$("#CGBZ_csv").attr("href", url + "CGBZ");
		$("#CGBX_table").attr("href",DATA_URL + "?cdid=CGBX&dataset=" + dataset + "&table-id=D");
		$("#CGBX_csv").attr("href", url + "CGBX");
		$("#CMVL_table").attr("href", DATA_URL + "?cdid=CMVL&dataset=" + dataset + "&table-id=D");
		$("#CMVL_csv").attr("href", url + "CMVL");

	}



	function tab(tab) {
		for ( var i=1; i<=7; i++){
			$("#tab"+i).css("display", 'none');
			$("#li_tab"+i).children(0).attr("class", '');
		}
		$("#tab8").css("display", 'none');

		document.getElementById('li_tab8').firstChild.setAttribute('class', 'grey');
		document.getElementById(tab).style.display = 'block';
		document.getElementById('li_'+tab).firstChild.setAttribute('class', 'active');
	}


	$(document).ready(function() {
		$("#currentGDP").text(GDPName[GDP_Flag]);
		var currentHeading = $("#heading" + GDP_Flag);
		currentHeading.append(" (Current)");
		updateGDP(GDP_Flag);

		$("a.showPanel").on('click', function(evt) {
			evt.preventDefault();
			var ref = evt.target.id;
			flag = ref.split("gdp")[1];
			GDP_Flag = flag;
			updateGDP(GDP_Flag);
		});

		$("a.blue.button").on('click', function(evt) {
			evt.preventDefault();
			
			var ref = $(this).attr("id");
			dataset = ref.split("_")[1];
			cdid = ref.split("_")[0];
			chartTitle = cdid ;
			
			//pull out the units from the DOM as they are not in the data
			var cell = $(this).parent();
			//check the position by looking for SA
			var sa = cell.prev().text();
			if(sa==="SA" || sa === "NSA"){
				units = cell.prev().prev().text();
			}else{
				units = cell.prev().prev().prev().text();
			}

			modal.open({content:"<div ><h2>Loading data...</h2></div>"
				, height: 300
				, width: 600
			})
			getData(chartTitle);
		});
    });


}(jQuery)); 
