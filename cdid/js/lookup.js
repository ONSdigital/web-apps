//--------------------------------------------------------------------------
//
//  CDID series lookup
//
//--------------------------------------------------------------------------


var lookup = (function(){

  var DOWNLOAD_URL = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/";

  var DATA_URL = "list.php";

  var CHECK_URL = "check.php";
  var downloadPath;
  var retrievedObject;
  var radioSelection;
  var $menu;
  var $dataTitle
  var $data;
  var $alert;
  var dataset;
  var inited = false;

  var CDIDarray = [];
  var CDIDObjects = {};
  var CDIDIndex = {};

  var requestDataset;
  var requestTopic;

  var tooltip;
  var topic;
  var topicArray = [

  {
    name:"Business"
    , topics: [
    "Mergers and Acquisitions"
    , "Business Investment"
    , "Insurance comps' pension funds' and trusts investment"
    , "Profitability of UK Companies"
    , "Assets, Liabilities and Transactions in Finance Leasing, factoring and Credit Granting"
    , "Turnover and Orders in Production and Services Industries"
    , "Monthly Review of External Trade"
    , "Trade by Industry"
    ]
    , seriesID : [
    "am"
    , "cxnv"
    , "mq5"
    , "prof"
    , "sdq7"
    , "topsi"
    , "mret"
    , "mq10"
    ]
  }
  ,
  {
    name:"National Accounts"
    , topics: [
    "Capital Stocks, Capital Consumption and Non-Financial Balance Sheets"
    , "Non Financial Balance Sheets"
    , "Detailed Index of Production"
    , "Index of Services First Release"
    , "Balance of Payments quarterly First Release"
    , "Blue Book"
    , "Consumer Trends"
    , "Gross Domestic Product: Preliminary Estimate"
    , "Pink Book"
    , "Regional Gross Domestic Household Income (NUTS 1,2 and 3)"
    , "Share Ownership"
    , "Second estimate of GDP"
    , "United Kingdom Economic Accounts"
    , "Public Sector Finances First Release"

    ]
    , seriesID : [
    "capstk"
    , "nfbs"
    , "diop"
    , "ios1"
    , "pnbp"
    , "bb"
    , "ct"
    , "pgdp"
    , "pb"
    , "rghi"
    , "srs"
    , "pn2"
    , "ukea"
    , "pusf"
    ]
  }
  ,
  {
    name:"Labour Market"
    , topics: [
    "Claimant Count and Vacancies"
    , "Employment and Earnings"
    , "Labour Market Statistics - Integrated FR"
    , "Productivity"
    , "Public Sector Employment"
    ]
    , seriesID : [
    "unem"
    , "emp"
    , "lms"
    , "prdy"
    , "pse"
    ]
  }
  ,
  {
    name:"Price Indices"
    , topics: [
    "Aerospace and electronics cost indices"
    , "Producer Prices Indices"
    , "PPI Aggregate Level"
    , "Consumer Price Indices"
    , "Retail Sales - Detailed Level"
    , "Services Producer Price Index (experimental statistics)"
    ]
    , seriesID : [
    "mm19"
    , "mm22"
    , "ppi"
    , "mm23"
    , "drsi"
    , "sppi"
    ]
  }
  ,
  {
    name:"Travel and Tourism"
    , topics: [
    "International Passenger Survey"
    ]
    , seriesID : [
    "ott"
    ]
  }

  ];





  function populateMenu(id){

    var idx ;

    

    switch(id){
      case "Business":
      idx=0;
      topic = "business";
      break;
      case "NatAccounts":
      idx=1;
      topic = "nationalaccounts";
      break;
      case "Labour":
      idx=2;
      topic = "labour";
      break;
      case "Prices":
      idx=3;
      topic = "prices";
      break;
      case "Travel":
      idx=4;
      topic = "tourism";
      break;



    }


    if(topicArray[idx]){
      topics = topicArray[idx].topics;
      series = topicArray[idx].seriesID;



      var html = "";

      $menu.empty();

      html += "<option value=''>Please select...</option>";

      $.each(topics, function(itemNo, item)
      {
        html += "<option value='" + series[itemNo] +"'>" + item +"</option>";
      });
      $menu.append(html);



      if(retrievedObject && !inited){
        inited = true;
        log("set retrieved :dataset "  +  retrievedObject.dataset);
            //select drop down
            $('select[name="topicMenu"]').find('option[value=' + retrievedObject.dataset + ']').attr("selected",true);
            dataset = retrievedObject.dataset;
          }else{

            //dataset = series[0].toLowerCase();

          }
          $data.html("Dataset is <strong>" + dataset + "</strong");
         // $dataTitle.html( $("select option:selected").html() );
          console.log($("select option:selected").text());
          console.log($("select option:selected"));
          console.log($("select option:selected").html());

        }
      }


      function createDatasetLink (isFormatCSV) {

        var path;
        var cdid = $("input[id=cdidBox]").val()  ;

        if(!dataset ){
          //$alert.text("Please select a dataset.");
          log("ALERT! No dataset");
        }

        // just store the data set
        saveLocal("");
        
        if (isFormatCSV){
          path = DOWNLOAD_URL + "csv.csv?dataset=" + dataset;
        }else{
          path = DOWNLOAD_URL + "xls-download.xls?dataset=" + dataset;
        }

        window.open(path, "_self");
      }



      function createLink (isFormatCSV) {

        
        var cdid = $("input[id=cdidBox]").val()  ;

        if(!dataset ){
          //$alert.text("Please select a dataset.");
          log("ALERT! No dataset");
        }else if(!cdid){
          //$alert.text("Please enter at least one series id.");
          log("ALERT! No cdid");
        }else{


          cdid = cdid.toUpperCase();

          cdid = cdid.replace(/\s+/g, '');

          var tempArray = cdid.split(",");
          var newString = "";
          var length = tempArray.length;
          var i=0;

          for ( i=0; i<length; i++){
            newString +=  tempArray[i] +",";
          }
            // remove trailing comma
            newString = newString.substr(0, newString.length-1);
            saveLocal(newString);

            

            if (isFormatCSV){
              downloadPath = DOWNLOAD_URL + "csv.csv?dataset=" + dataset + "&cdid=" + newString;
            }else{
              downloadPath = DOWNLOAD_URL + "xls-download.xls?dataset=" + dataset + "&cdid=" + newString;
            }

            checkCDID(newString);
            //window.open(path, "_self");

          }

        }



        function checkCDID(cdid){

          $.ajax
          ({
            dataType: "json",
            url: CHECK_URL,
            data: "table=" + topic + "&cdid=" + cdid,
            success: function(data)
            {

              var result = data;
              log(result);
              log(result.cdid);

              if(result.cdid==="" || result.cdid==="none"){
                window.open(downloadPath, "_self");
              }else{
                var response = "Note: The following CDID references where not found in the <strong>" + dataset.toUpperCase() + "</strong> dataset:<br/>" + result.cdid;
                response += "<p>Please remove the CDID and retry.</p>"
                //$alert.html(response);

              }
              
            },
            error: function (xhr, textStatus, errorThrown)
            {
              log("error");
              log(xhr);
              log(textStatus);
              log(errorThrown);

            }

          });

        }



        function setMenu(){
          log("setMenu " + retrievedObject.dataset);
          //set radio button
          $('#' + retrievedObject.radio).attr('checked', true);
          // populate menu
          populateMenu(retrievedObject.radio);

          //add cdid text
          $("input[id=cdidBox]").val(retrievedObject.CDID);

        }



        function saveLocal(cdid){
          // Put the object into storage
          var store = { };
          store.radio = radioSelection;
          store.dataset = dataset.toLowerCase();
          store.CDID = cdid;

          localStorage.setItem('CDID', JSON.stringify(store) );

          log("SAVE !" + radioSelection);
          log(store);
        }
  


        function retrieveLocal(){
          // Retrieve  the object from storage
          var obj = localStorage.getItem('CDID');
          log( JSON.parse( localStorage.getItem( 'CDID' ) ) );
          retrievedObject = JSON.parse( obj );

           log("RETRIEVED! " + retrievedObject.radio);
          radioSelection = retrievedObject.radio;

        }



        function loadData(){
          log( "loadData" );

          $('#cdidTable').dataTable().fnReloadAjax( DATA_URL+"?t="+requestTopic+'&ds='+requestDataset );

        }




      function createLink (isFormatCSV) {

        
        var cdid = CDIDarray.toString()  ;

        if(!dataset ){
          //$alert.text("Please select a dataset.");
          log("ALERT! No dataset");
        }else if(!cdid){
          //$alert.text("Please enter at least one series id.");
          log("ALERT! No cdid");
        }else{


          cdid = cdid.toUpperCase();
          cdid = cdid.replace(/\s+/g, '');
            

            if (isFormatCSV){
              downloadPath = DOWNLOAD_URL + "csv.csv?dataset=" + dataset + "&cdid=" + cdid;
            }else{
              downloadPath = DOWNLOAD_URL + "xls-download.xls?dataset=" + dataset + "&cdid=" + cdid;
            }

            window.open(downloadPath, "_self");

          }

        }


        function updateSelection(){
          //rewrite CDIDarray into table
          var html ="<tr><th width='20%'></th><th width='85%'></th><th></th width='5%'></tr>";


          $('a.infoBtn').off('click');
          $selection.empty();



          $.each(CDIDarray, function(index, item){
            console.log("add row:"  + item);
            //<a href="#" class="tooltip" data-tip="this is the tip!">This is the link</a>
            //<a href="#" data-toggle="tooltip" title="Some tooltip text!">Hover over me</a>
            html+="<tr>";
            html+="<td><small>" + item + "</small></td>";
            html+="<td><small>";
            //html+="<a href='#' class='' data-tip='this is the tip!'>This is the link</a>";
            html+='<a href="#" id="tooltips" class="tooltips" data-toggle="tooltips" title="' + CDIDObjects[item] + '">';
            html+= CDIDObjects[item].substr(0,25) + "...</a>";
            html+="</small></td>";
            html+="<td><a class='infoBtn ' href='' id=" + item + " >";
            html+="<span class='glyphicon glyphicon-remove-circle'></span></a></td>";
            html+="</tr>";

          });




          $selection.append(html);

          //init
          $('.tooltips').tooltip();
          //$('#example').tooltip('show');

          $('a.infoBtn').on('click', function(evt){
            evt.preventDefault();
            console.log($(this) );
            console.log($(this.parent) );
            console.log("deselect " + this.id);
            console.log("update row " + CDIDIndex[this.id]);


            var index = CDIDarray.indexOf(this.id);
            if (index > -1) {
              CDIDarray.splice(index, 1);
            }
            updateSelection();


           // var rows = $('tr', $selection);
            //var rows = $('#selection table:first > tbody > tr')
            var idx = CDIDIndex[this.id]+2;
            console.log(" remove item " + idx);
            var $target = $('#cdidTable tr').eq( idx );

            if ( $target.hasClass('row_selected') ){
              console.log("REMOVE class " + idx );
              $target.removeClass('row_selected');
            }
            else{
              console.log("ADD class " + idx );
              $target.addClass('row_selected');
            }
            

          });
        }




        $.fn.dataTableExt.afnFiltering.push(
            function( oSettings, aData, iDataIndex ) {

              //console.log("fn filtering " + $('#seriesFilter').val() );

              var cdid = $("#seriesFilter").val();

              if(cdid.length<=0){
                return true;
              }else{
                  cdid = cdid.toUpperCase();
                  cdid = cdid.replace(/\s+/g, '');

                  var tempArray = cdid.split(",");
                  var newString = "";
                  var length = tempArray.length;
                  var i=0;

                  for ( i=0; i<length; i++){
                    var rowID = aData[0];
                    var id = tempArray[i];
                    //console.log( "check " + id + ":" + rowID +"::" + rowID.indexOf(id) );
                    if(rowID.indexOf(id)>-1){
                      return true;
                    }

                  }

                  return false;
                
              }


            }
        );



      $(document).ready(function() {
        log('Ready');

        $menu = $("select.topicMenu");
        $dataTitle = $("#dataTitle");
        $data = $("#data");
        $selection = $("#selection");

        var id = $("input[name='topic']:checked", '#topic').attr("id");
        console.log(id);
        console.log("got radio button " + id);

        if(id){
          populateMenu(id);
          radioSelection = id;
          
        }

        $("input:radio").click(function(){
          radioSelection = this.id;
          log("snap! "  + radioSelection);
          //$alert.text("");
          populateMenu(this.id);
        });


        $menu.change(function(){
          dataset = this.value.toLowerCase();
          $dataTitle.html( $("select option:selected").html() );
          $data.html("Dataset is <strong>" + dataset + "</strong>");
          log("GET DATA ! "  + radioSelection);

          if(radioSelection==="NatAccounts"){
            requestTopic = "nationalaccounts";
          }else{
            requestTopic = radioSelection.toLowerCase();
          }

          requestDataset = dataset;

          loadData();
        }); 


        oTable =  $('#cdidTable').dataTable(
          {
            "aoColumns": [
                              { "sWidth": "5%", "sClass": "text-left" },
                              { "sWidth": "70%", "sClass": "text-left" },
                              { "sWidth": "13%", "sClass": "text-right" },
                              { "sWidth": "3%", "sClass": "text-right" },
                              { "sWidth": "3%", "sClass": "text-right" },
                              { "sWidth": "3%", "sClass": "text-right" },
                              { "sWidth": "3%", "sClass": "text-right" },
                             // { "sWidth": "5%", "sClass": "center", "bSortable": false },
                          ],

            "iDisplayLength": 50,
            "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
            "sPaginationType": "bootstrap",
            "sDom": '<"top"f>rt<"bottom" lp><"clear">'
          }
        );




        $("#cdidTable tbody").delegate("tr", "click", function(event) {
          var cdidText = $("td:first", this).text();
          //console.log("cdidText " + cdidText);
          var cdidCopy = $("td:nth-child(2)", this).text();
          //console.log("cdidCopy " + cdidCopy);
          var rowIndex = $(this).index();
          console.log(cdidText + " rowIndex " + rowIndex);
         // console.log($(this));

          if ( $(event.target.parentNode).hasClass('row_selected') ){
            $(event.target.parentNode).removeClass('row_selected');
            var index = CDIDarray.indexOf(cdidText);
            if (index > -1) {
              CDIDarray.splice(index, 1);
            }

          }else{
            $(event.target.parentNode).addClass('row_selected');
            CDIDarray.push(cdidText);
          } 

          CDIDObjects[cdidText] = cdidCopy;
          CDIDIndex[cdidText] = rowIndex;

          //console.log(CDIDarray);
          updateSelection();
           
        });


        $("#downloadCSVBtn").on('click', function(evt) {
          evt.preventDefault();
          log("generate CSV link...");
          createLink(true);
        });

        $("#downloadXLSBtn").on('click', function(evt) {
          evt.preventDefault();
          log("generate XLS link...");
          createLink(false);
        });


        // add key listener to custom filter input
        $('#cdid_filter').keyup( function() { 
          console.log("key up");
          oTable.fnDraw(); 

        } );

        //console.log( $("div#cdidTable_filter label").text() );
        console.log( $("div#cdidTable_length label").html() );
        

        
       // $("div#cdidTable_filter label").html( "<strong>or</strong><br/> Search description: <input aria-controls='cdidTable' type='text'>");
        $("div#cdidTable_length label").html( 'Show <select aria-controls="cdidTable" size="1" name="cdidTable_length"><option value="20">20</option><option selected="selected" value="50">50</option><option value="100">100</option><option value="-1">All</option></select> records per page');

     });





}());




// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments)[0] );
  }
};