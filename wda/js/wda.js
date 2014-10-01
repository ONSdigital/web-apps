var wda = (function () {

  // create a central model for the data
  // store each area based on the ONS ID
  // eg { "" }
  //var model = {};

  var POSTCODE_URL = "//mapit.mysociety.org/postcode/";

  var postcodes = [
                    "B15 2TT", "BS8 1TH", "CB2 3PP", "CF10 3BB", "DH1 3EE",
                    "EX4 4SB", "SW7 2AZ", "LS2 9JT", "L69 3BX", "M13 9PL",
                    "NE1 7RU", "NG7 2NR", "OX1 2JD", "S10 2TN", "SO23 8DL",
                    "CV4 7AL", "YO10 5DD", "E1 4NS", "WC2A 2AE", "WC2R 2LS"
                  ];



  $(document).ready(function() {

    initializeMap();
    initCharts();

    addListeners();

  });



  function randomPostcode () {

    var ran = Math.floor(Math.random()*postcodes.length);
    pcode = postcodes[ran];
    $("#postcode").val( pcode );

  }



  function testPostcode () {

    var pcode = $("#postcode").val();
    var newPostCode = checkPostCode( pcode );
    if (newPostCode) {
      postcode = newPostCode;

      $("#postcode").val( newPostCode );
      var url = POSTCODE_URL + newPostCode;
      loader.setUrl( url );
      loader.loadData( parseData );

    }
    else {
      console.log ("Postcode has invalid format");
    }

  }



  function parseData(data){
    //console.log(data);
    var lat = data.wgs84_lat;
    var lon = data.wgs84_lon;

    var council = data.shortcuts.council;

    if(data.shortcuts.council.county){
      council = data.shortcuts.council.county;
    }

    var name = data.areas[council].name;
    var ons_id = data.areas[council].codes.gss;

    // display marker, and the district boundary on the map
    showPoint( lat,lon );
    displayArea( ons_id );
    censusAPI.getData( ons_id);
    censusAPI.setTitle( name );
  }



  function addListeners(){

    Mousetrap.bind(['command+z', 'ctrl+z'], function(e) {
        randomPostcode();
        return false;
    });


    $("#search").click( function(evt){
      evt.preventDefault();
      testPostcode();
    })


  }



})();
