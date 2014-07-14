//--------------------------------------------------------------------------
//
//  CDID series datatable
//
//--------------------------------------------------------------------------


var csvProcessing = (function(){
//BUSINESS

 var DATASET = "AM";
 // var DATASET = "CXNV";
 // var DATASET = "CCB?";
 // var DATASET = "MQ5";
 // var DATASET = "PROF";
 // var DATASET = "SDQ7";
 // var DATASET = "TOPSI";
 // var DATASET = "MRET";
 // var DATASET = "MQ10";



//NATIONAL ACCOUNTS
/*
 // var DATASET = "CAPSTK";
 // var DATASET = "NFBS";
 // var DATASET = "DIOP";
 // var DATASET = "IOS1";
//  var DATASET = "PNBP";
 // var DATASET = "BB";
 // var DATASET = "CT";
 // var DATASET = "PGDP";
 // var DATASET = "PB";
 // var DATASET = "RGHI";
 // var DATASET = "SRS";
 // var DATASET = "PN2";
 var DATASET = "UKEA";
*/

// LABOUR MARKET

 // var DATASET = "UNEM";
 // var DATASET = "EMP";
 // var DATASET = "LMS";
 // var DATASET = "MQ5";
 // var DATASET = "PRDY";
 // var DATASET = "PSE";


// PRICES

 // var DATASET = "MM19";
 // var DATASET = "MM22";
 // var DATASET = "MM23";
 // var DATASET = "PPI";
 // var DATASET = "DRSI";
 // var DATASET = "SPPI";
 //var DATASET = "OTT";





  // var DATASET = "PUSF";
  var BASE_URL = "data/" + DATASET.toLowerCase()+ ".csv";
  var result;
  var newData = [];


  
   
  function loadData(){

    $.ajax
    ({
      dataType: "text",
      url: BASE_URL,
      // data: "dataset=" + dataset + "&cdid=" + cdid,
      success: function(data)
      {
        result = $.csv.toArrays(data);
        
       // console.log(result);
        splitData();
      },
      error: function (xhr, textStatus, errorThrown)
      {
        console.log("error");

      }

    });

  }

  // loop through the array and find the start of the descriptions
  // look for copyright text
  // split main array and discard data before that point

        function splitData(){
          var i
          , j
          , listLength = result.length
          , trace ="";


          console.log("listLength "+ listLength);

          for ( i = 0; i < listLength; i++) {

            if (result[i][0].indexOf("Crown Copyright")>-1){
              break;
            }

          }

          console.log("GOTTA SPLIT " + i);

          // cut down array
          // note there is a blank line after crown copyright

          result.splice(0,i+2);
          listLength = result.length;


          // loop through the new list and reformat it
          // NB step through five items
          for ( i = 0; i < listLength-5; i=i+5) {
           //console.log(i + ": " + result[i]);
            var temp = [];

            // find and replace £ symbol
            var x = encodeURIComponent(result[i][1]);
            x = x.split("%EF%BF%BD").join("\u00A3");
            var tempTitle = decodeURIComponent(x);

            // look for existing inverted commas
            tempTitle = tempTitle.split("\"").join("");
            tempTitle = "\"" + tempTitle + "\"";


            temp[0] = result[i][0];
            temp[1] = tempTitle;
            temp[2] = result[i+1][1].split("seasonal_adjustment='").join("").split("'").join("");
            temp[3] = result[i+2][1].split("base_period='").join("").split("'").join("").split("-").join("0");
            temp[4] = result[i+3][1].split("price='").join("").split("'").join("");
            temp[5] = result[i+4][1].split("index_period='").join("").split("'").join("").split("-").join("0");
            temp[6] = DATASET;

            newData.push(temp);

            trace+=temp+"<br/>";
          }


         $("#trace").html(trace);

          console.log(newData[0]);
          console.log(newData[newData.length]);
          console.log("length " + newData.length);

    }



    $(document).ready(function() {
      loadData();


    });




}());




