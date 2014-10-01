var censusAPI = (function () {

var groups;
var housing = [];
var summary = {};

var chartData
/*

*/

var POSTCODE = "NP198FP";

var URL = "http://neighbourhood.statistics.gov.uk/NDE2/Disco/FindAreas?Postcode=";// + "&LevelType=13&HierarchyId=17";
var NAME_URL = "http://neighbourhood.statistics.gov.uk/NDE2/Disco/FindAreas?AreaNamePart=";// + "&LevelType=13&HierarchyId=17";
var SUBJECTS_URL = "http://neighbourhood.statistics.gov.uk/NDE2/Disco/GetCompatibleSubjects?AreaId=";
var DATA_URL = "http://neighbourhood.statistics.gov.uk/NDE2/Deli/getTables?Areas=";

var mainTitle;
var countryId;
var country;


var subjects =  [
            { id: 58, name: 'Census', short: 'Census', vars:[] }
          , { id: 3, name: 'Crime and Safety', short: 'Crime', vars:[] }
          , { id: 4, name: 'Economic Deprivation', short: 'Deprivation', vars:[] }
          , { id: 5, name: 'Education, Skills and Training', short: 'Education', vars:[9993,9994,9995,9996] }
          , { id: 6, name: 'Health and Care', short: 'Health', vars:[] }
          , { id: 7, name: 'Housing', short: 'Housing', vars:[5214,5207,5226,5221,5209,5593] }
        //  , { id: 7, name: 'Housing', short: 'Housing', vars:[5214,5207,5226,5221,5209,5593,5204,5199,5205,5211,5213,5206,5215,5200,5222,5202,5224,5216,5592,5208,5203,5201,5595,5225,5210,5198,5212,5594] }
          , { id: 46, name: 'Indicators', short: 'Indicators', vars:[] }
          , { id: 10, name: 'Indices of Deprivation and Classification', short: 'Indices of Deprivation', vars:[] }
          , { id: 14, name: 'People and Society: Income and Lifestyles', short: 'Income and Lifestyles', vars:[4931,4932,4933,4934,4935,4936,4937,4938,4939,4940,4941,4942,1159,786,790,791,795,787,798,788,797,792,796,794,793] }
          , { id: 13, name: 'People and Society: Population and Migration', short: 'Population', vars:[] }
          , { id: 8, name: 'Physical Environment', short: 'Environment', vars:[] }
          , { id: 9, name: 'Work Deprivation', short: 'Work Deprivation', vars:[] }
        ];



  var subjectId = 8;

$(document).ready(function(){

      clearPanel();
      setSubject();

});



function setSubject(){
  var len = 3;//subjects.length;
  var random = Math.round( Math.random()*len ) -1;

  switch(random){
    case 0:
    subjectId = 3;
    break;
    case 1:
    subjectId = 5;
    break;
    case 2:
    subjectId = 8;
    break;


  }

//console.log (random + " subjectId " + subjectId);
}


function getStats(postcode, isPostcode){
  //randomise subject...
  setSubject();
  var url;

  if(isPostcode){
    url = URL;
  }else{
    url = NAME_URL;
  }

  //console.log ("getStats " + postcode);
  //console.log ("getStats " + postcode);
  var id;
  mainTitle = "";

  $.ajax({
    type: "GET",
    url: url + postcode,
    dataType: "xml",
    success: function(xml){
     //console.log(xml);
     // $("#content").append("<ul></ul>");
      $(xml).find('Area').each(function(){
       //console.log($(this) );
/*
        var sLevel = $(this).find('LevelTypeId').text();
        var hierarch = $(this).find('HierarchyId').text();
        var areaID = $(this).find('AreaId').text();
        var sPublisher = $(this).find('HierarchyId').text();

        //$("<li></li>").html(areaID + ", level:" + sLevel+ ", HierarchyId:" + hierarch).appendTo("#content ul");
        if(sLevel==="13"){
          id =  areaID;
          mainTitle = $(this).find('Name').text();

        };

        if(sLevel==="10"){
          countryId = areaID;
          country = $(this).find('Name').text();
        };
*/
      });
      //getSummary(id);
      //getData(id);

      $('#areaTitle').text( mainTitle +", " + postcode.toUpperCase() + ": " + subjects[subjectId].short);


    },
    error: function() {
      //console.warn("An error occurred while processing XML file.\nProbably outside England and Wales");
      var extract = "The Neighbourhood Statistics website is part of the ONS. It has over 550 datasets across ten different subjects.";
      $('#extract').html( extract );
    }
  });

}




function getSummary(areaID){
  //console.log ("getStats " + areaID);
  var count = [];
  var subjectCount = 0;

  $.ajax({
    type: "GET",
    url: SUBJECTS_URL + areaID,
    dataType: "xml",

    success: function(xml){
     /// //console.log(xml);

      var subjects = $(this).find('SubjectsWithCount').children('SubjectWithCount').length;
      //console.log( "n o subs " + subjects);
      $(xml).find('Count').each(function(){
       /// //console.log( $(this) );
        count.push( parseInt( $(this).text() ) );
        subjectCount++;


      });
      var total = count.reduce(function(a, b) {
            return a + b;
          });

    //console.log( count );
    //console.log( subjectCount +":"+ total);

    var summary = "This postcode is part of the " + mainTitle.toUpperCase() + " administrative area.";
    summary += " There are " + total + " datasets containing data on " + subjectCount + " different subjects for this neighbourhood.";
    $('#summary').text( summary );


    },

    error: function() {
      //console.warn("An error occurred while processing XML file.\nProbably outside England and Wales");
      var extract = "The Neighbourhood Statistics website is part of the ONS. It has over 550 datasets across ten different subjects.";
      $('#extract').html( extract );
    }
  });

}

function clearPanel(){

 // //console.log("clear");
  $( "#panel" ).animate({
    top: 110
    }, 100, function() {
    // Animation complete.
  //console.log("clear complete");
    $('#extract').html( "" );
  });

}

/*
"@codelist": "CL_0000138",
"@conceptRef": "Concept_56",
},
{
"@codelist": "CL_0000159",
"@conceptRef": "Concept_45",
},
{
"@codelist": "CL_0000154",
"@conceptRef": "Concept_57",

*/


//build temp look up for each concept and populate with descriptions

var Concept_57 = {
  'CI_0001828': 'All categories: Tenure',
  'CI_0001826': 'Owned or shared ownership: Total',
  'CI_0000117': 'Owned: Owned outright',
  'CI_0001831': 'Owned: Owned with a mortgage or loan or shared ownership',
  'CI_0001829': 'Social rented: Total',
  'CI_0000069': 'Social rented: Rented from council (Local Authority)',
  'CI_0000068': 'Social rented: Other social rented',
  'CI_0001830': 'Private rented or living rent free: Total',
  'CI_0000075': 'Private rented: Private landlord or letting agency',
  'CI_0001827': 'Private rented: Other private rented or living rent free'
};

var Concept_45 = {
  'CI_0001707': 'All categories: Accommodation type',
  'CI_0001706': 'Whole house or bungalow: Total',
  'CI_0000071': 'Whole house or bungalow: Detached',
  'CI_0000070': 'Whole house or bungalow: Semi-detached',
  'CI_0000069': 'Whole house or bungalow: Terraced (including end-terrace)',
  'CI_0001704': 'Other: Total',
  'CI_0000068': 'Other: Flat, maisonette or apartment in a purpose-built block of flats or tenement',
  'CI_0000075': 'Other: Flat, maisonette or apartment that is part of a converted or shared house (including bed-sits)',
  'CI_0001705': 'Other: Flat, maisonette or apartment in a commercial building, or mobile/temporary accommodation'
};

var Concept_56 = {
  'CI_0000210': 'All categories: Number of persons per room in household',
  'CI_0000071': 'Up to 0.5 persons per room',
  'CI_0000070': 'Over 0.5 and up to 1.0 persons per room',
  'CI_0000069': 'Over 1.0 and up to 1.5 persons per room',
  'CI_0000068': 'Over 1.5 persons per room'
};




function setTitle(name){
  $("#title").text( "Tenure: " +  name);
  $("#title2").text( "House Type: " +  name);

}



function getData(areaID){
  //console.log ("getData " + areaID);
  var titles = [];
  var values = [];
  housing = [];
  var subjectCount = 0;

  if (countryId){
    countryId = "," + countryId;
  }else{
    countryId = "";
  }

  //console.log ("getData " + DATA_URL + areaID  + countryId + "&Variables=" + subjects[subjectId].vars.toString());

       groups = [];
//areaID = "E07000087";
  $.ajax({
    type: "GET",
   // url: DATA_URL + areaID  + countryId + "&Variables=9993,9994,9995,9996&GroupByDataset=Yes",
   // url: DATA_URL + areaID  + countryId + "&Variables=5214,5207,5226,5221,5209,5593,5204,5199,5205,5211,5213,5206,5215,5200,5222,5202,5224,5216,5592,5208,5203,5201,5595,5225,5210,5198,5212,5594&GroupByDataset=Yes",
    //url: DATA_URL + areaID  + countryId + "&Variables=" + subjects[subjectId].vars.toString() + "&GroupByDataset=Yes",
   // url: "http://data.ons.gov.uk/ons/api/data/dataset/QS405EW.xml?apikey=GSHkFLF2TO&context=Census&geog=2011WARDH&dm/2011WARDH=" + areaID + "&totals=false",

   // DC4101EW Tenure by household composition

   // DC4606EW Tenure by number of bedrooms by occupation of Household Reference Person (HRP)

   // DC4406EW Tenure by number of persons per room in household by accommodation type
    url: "http://data.ons.gov.uk/ons/api/data/dataset/DC4406EW.json?apikey=GSHkFLF2TO&context=Census&geog=2011HTWARDH&dm/2011HTWARDH=" + areaID + "&totals=false",
    dataType: "json",

    success: function(json){
      //console.log("DATA");
       //   //console.log(xml);

      //console.log(json);
      //console.log(json["ons.dataPackage"]);
      //console.log(json["ons.dataPackage"]["ons.genericData"]);

      var dp = "ons.dataPackage";
      var gen = "ons.genericData";
      var ds = "message.DataSet";
      var group = "generic.Group";
      var series = "generic.Series";
      var struct = "ons.structureData";
      var lists = "message.CodeLists";
      var list = "structure.CodeList";
      var code = "structure.Code";

      var json = json[dp];

      summary = {};
      var max = 0;
      var maxID =0;
      var series = json[gen][ds][group][series];


        chartData = [{
            name: 'Owned or shared',        // 0
            data: []

        }, {
            name: 'Owned outright',         // 1
            data: []

        }, {
            name: 'Mortgage or loan',       // 2
            data: []

        }, {
            name: 'Rented from council',    // 3
            data: []

        }, {
            name: 'Other social rented',    // 4
            data:[]

        }, {
            name: 'Private landlord',       // 5
            data: []

        }, {
            name: 'Other private rented',   // 6
            data: []

        }]

      $.each (series, function (index, value){

        var field1 = value["generic.SeriesKey"]["generic.Value"][1]["@value"];
        var field2 = value["generic.SeriesKey"]["generic.Value"][2]["@value"];
        var field3 = value["generic.SeriesKey"]["generic.Value"][3]["@value"];

        var tenureTitle = Concept_57[field1];
        var peopleTitle = Concept_56[field2];
        var houseTitle = Concept_45[field3];

        var obsValue = parseInt(value["generic.Obs"]["generic.ObsValue"]["@value"]);


        // NB ignore the people part first until we get some data displayed
        // ASSUME CORECT ORDER OF TYPES
        /*
        eg
        Detached
        Semi
        Terraced
        Flat
        Flat, shared
        Flat, Commercial
        */


        if ( peopleTitle === "All categories: Number of persons per room in household" ){
          //console.log(Concept_57[field1] +" :: " + Concept_56[field2] + " :: " + Concept_45[field3]  + " :: " + obsValue);

          if ( tenureTitle === "Owned or shared ownership: Total" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
             //console.log(Concept_57[field1] +" :: " + Concept_56[field2] + " :: " + Concept_45[field3]  + " :: " + obsValue);
             chartData[0].data.push( obsValue );
            }
          }

          if ( tenureTitle === "Owned: Owned outright" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
              chartData[1].data.push( obsValue );
            }
          }

          if ( tenureTitle === "Owned: Owned with a mortgage or loan or shared ownership" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
              chartData[2].data.push( obsValue );
           }
          }

          if ( tenureTitle === "Social rented: Rented from council (Local Authority)" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
              chartData[3].data.push( obsValue );
            }
          }

          if ( tenureTitle === "Social rented: Other social rented" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
            chartData[4].data.push( obsValue );
            }
          }

         if ( tenureTitle === "Private rented: Private landlord or letting agency" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
              chartData[5].data.push( obsValue );
            }
          }

          if ( tenureTitle === "Private rented: Other private rented or living rent free" ){
            if ( houseTitle !== "All categories: Accommodation type" && houseTitle !== "Whole house or bungalow: Total" && houseTitle !== "Other: Total" ){
              chartData[6].data.push( obsValue );
            }
          }

        }
      });


        // SLICE the data by TENURE

        $.each (chartData[0].data, function (index, value){
          //console.log( value );
          typeChart.series[5-index].setData( [value] );
          //typeChart.series[6-index].show( );
          //typeChart.series[6-index].update({ showInLegend: true});
        })

        $.each (chartData[1].data, function (index, value){
          ownedChart.series[index].setData( [value] );
          ownedChart.series[index].show( );
          ownedChart.series[index].update({ showInLegend: true});
        })


        $.each (chartData[2].data, function (index, value){
          mortageChart.series[index].setData( [value] );
          mortageChart.series[index].show( );
          mortageChart.series[index].update({ showInLegend: true});
        })


        $.each (chartData[3].data, function (index, value){
          councilChart.series[index].setData( [value] );
          councilChart.series[index].show( );
          councilChart.series[index].update({ showInLegend: true});
        })


        $.each (chartData[4].data, function (index, value){
          socialChart.series[index].setData( [value] );
          socialChart.series[index].show( );
          socialChart.series[index].update({ showInLegend: true});
        })

        $.each (chartData[5].data, function (index, value){
          landlordChart.series[index].setData( [value] );
          landlordChart.series[index].show( );
          landlordChart.series[index].update({ showInLegend: true});
        })


        $.each (chartData[6].data, function (index, value){
          otherChart.series[index].setData( [value] );
          otherChart.series[index].show( );
          otherChart.series[index].update({ showInLegend: true});
        })

        // slice the data by housing type


        $.each (chartData, function (index, value){

          //console.log(value);
          if(index>0){
            i = index-1;
            detachedChart.series[i].setData( [value.data[0]] );
            detachedChart.series[i].name = value.name;
            detachedChart.series[i].show( );
            detachedChart.series[i].update({ showInLegend: true});

            semiChart.series[i].setData( [value.data[1]] );
            semiChart.series[i].name = value.name;
            semiChart.series[i].show( );
            semiChart.series[i].update({ showInLegend: true});

            terracedChart.series[i].setData( [value.data[2]] );
            terracedChart.series[i].name = value.name;
            terracedChart.series[i].show( );
            terracedChart.series[i].update({ showInLegend: true});

            flatChart.series[i].setData( [value.data[3]] );
            flatChart.series[i].name = value.name;
            flatChart.series[i].show( );
            flatChart.series[i].update({ showInLegend: true});

            sharedChart.series[i].setData( [value.data[4]] );
            sharedChart.series[i].name = value.name;
            sharedChart.series[i].show( );
            sharedChart.series[i].update({ showInLegend: true});

            commercialChart.series[i].setData( [value.data[5]] );
            commercialChart.series[i].name = value.name;
            commercialChart.series[i].show( );
            commercialChart.series[i].update({ showInLegend: true});

            var total = value.data.reduce(function(a, b) {
                      return a + b;
                    });
            tenureChart.series[5-i].setData( [total] );
            tenureChart.series[5-i].name = value.name;

          }

        });


    },

    error: function() {
      //console.warn("An error occurred while processing XML file.");
      var extract = "The Neighbourhood Statistics website is part of the ONS. It has over 550 datasets across ten different subjects.";
      $('#extract').html( extract );
    }
  });

}



    return{
      getStats:getStats,
      getData:getData,
      setTitle: setTitle
    }


})();
