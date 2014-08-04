<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Economic Snapshot: O N S</title>

  <link href='//fonts.googleapis.com/css?family=Open+Sans:300,400,800' rel='stylesheet' type='text/css'>

  <link rel="stylesheet" href="css/jquery.mobile-1.4.2.css" />
  <link type="text/css" rel="stylesheet" href="css/demo.css" />
  <link type="text/css" rel="stylesheet" href="css/jquery.mmenu.css" /> 
  <link type="text/css" rel="stylesheet" href="css/snapshot.css" /> 

  
  <script src="js/jquery-1.10.1.min.js"></script>
  <script src="js/jquery.mobile-1.4.2.js"></script>
  <script src="js/highcharts.js"></script>




  <script id="panel-init">
  $(function() {
    $( "body>[data-role='panel']" ).panel();
  });
  </script>

</head>



<body>
  <div data-role="panel" id="defaultpanel" data-position="left" data-display="overlay" data-theme="b">
    <!-- panel content goes here -->

    <nav id="menu">
      <ul>
        <li><a href="#home"  data-transition="slide">home</a></li>
        <li><a href="#gdp"  data-transition="slide">GDP</a></li>
        <li><a href="#bop"  data-transition="slide">BoP</a></li>
        <li><a href="#labour"  data-transition="slide">Labour</a></li>
        <li><a href="#prices" data-transition="slide" >Prices</a></li>
        <li><a href="#sales" data-transition="slide" >Sales</a></li>
        <li><a href="#debt" data-transition="slide" >Debt</a></li>
      </ul>

      <ul>
        <li><a href="//www.ons.gov.uk">O N S</a></li>
      </ul>

    </nav>

  </div><!-- /panel -->


<?php

  // connection details
  $db       = 'ons_dataset';
  $dbhost   = 'localhost';
  $dbuser   = 'root';
  $dbpass   = 'root';

  
  $table = 'Series';


  // set up array to hold data
  $items = array();
  $sparks = array();  // spark line data
  $block = array();   // block of current data values
  $data = array();   // block of current data values
  $names = array();   // block of current data values


  //create a mySQL connection
  $dbConn = new mysqli($dbhost, $dbuser, $dbpass, $db );

  mysqli_set_charset ($dbConn , 'utf8' );

  if($dbConn->connect_errno > 0){
    die('Unable to connect to database [' . $dbConn->connect_error . ']');
  }

  $sql ="SELECT * FROM $table";

  if(!$result = $dbConn->query($sql)){
      die('There was an error running the query [' . $dbConn->error . ']');
  }else{

      while($row = $result->fetch_assoc()){
        $items[] = $row;
        $extract = $row["extractDate"];
        $dateArray = explode( ",", $row['Dates'] );
        $dates[] = $dateArray;

        // the data is a bit involved:
        // get the data string and split into array NB: FOR EACH SERIES ID
        $datum = explode( ",", $row['Data'] );
        $name =  $row['Title'] ;

        // get last values
        $count = count( $datum );

        $lastDate[] = $dateArray[$count-1];

        $secondlastValue = 0;

        for ($i=0;$i<$count; $i++){

          if( $datum[$i] === '' ){
            // set null values for highcharts
             $datum[$i] = "null";//NULL;
          }else{
            $lastValue = $datum[$i];

            if( $i >0 ){
              $secondlastValue = $datum[ ($i-1) ];
            }
            
          }

        }

        $change = $lastValue - $secondlastValue;
        $change = round ( $change, 2);

        if($row["Unit"]==="%"){
          $pcChange=" ( - )";
        }else{
          $pcChange= 100 * $change/$lastValue;
          $pcChange= "(" . round ( $pcChange, 2) . "%)";
        }

        //format
        $pos = strpos($row["Unit"], '£');
        
        if( $pos > -1) {
          $start = "+£ ";
          $end  = substr($row["Unit"], ($pos+2), ($pos+2) );  
          if ($lastValue<0){
            $start = "-£ ";
          }

          $billn = strpos($row["Unit"], 'billion');
          
          if($billn>-1){
            $display[] = $start . abs($lastValue) . $end . "n";

          }else{
            $display[] = $start . abs($lastValue) . $end ;
            
          }
        }else{
          $display[] = $lastValue . " " . $row["Unit"];
        }


        $block[] = "    <span>Latest data: " . $lastValue  . "</span><br/>
                        <span>Change data: " . $change . $pcChange . "</span><br/>
                        <span>" . $row['Description'] . "</span><br/>
                        <span>CDID: " . $row['CDID'] . "</span><br/>";

        $comma_separated = implode(",", $datum);

        $sparks[] = '<span class="sparkline" data-sparkline-data="[' . $comma_separated . ']"></span>';
        $data[] = $datum;
        $names[] = $name;
      }
    }


    $titles = array("GDP", "BoP", "Labour", "Prices", "Sales", "Debt");
    $fullTitles = array("Gross Domestic Product", "Balance of Payments", "Labour Market", "Price Indices", "Retails Sales", "Net Debt");
    $yAxis = array("GDP (£ million)", "£ million", "Millions", "Indices (Consumer, 1987 and Retail, 2005)", "Index (2010)", "Net Debt (£ bn)");
    $itemCounts = array(5,1,7,8,3,4);



    $count =0;
    $i =0;
    $row = "";

    // details of which CDID are part of which group
    $tables =array();
    $tables[0] = array(0,1,2,3,4);                        // gdp
    $tables[1] = array(5);                                // bop
    $tables[2] = array(6,7,8,9,10);                       // labour
    $tables[3] = array(13, 14, 15, 16, 17, 18, 19, 20);   // price indices
    $tables[4] = array(21, 22, 23);                       // sales
    $tables[5] = array(24, 25, 26, 27);                   // debt



    // details of which CDID are displayed in which chart
    $charts =array();
    $charts[0] = array(0,1, 2, 3);                        // gdp
    $charts[1] = array(5);                                // bop
    $charts[2] = array(7,9,10, 6, 8);                     // labour
    $charts[3] = array(13, 15, 17, 19, 14, 16, 18, 20);   // price indices
    $charts[4] = array(21, 22, 23);                       // sales
    $charts[5] = array(24, 26, 25, 27);                   // debt


    // details of which CDID are displayed in Headlines
    $headlines =array();
    $headlines[0] = array();             // gdp
    $headlines[1] = array();             // bop
    $headlines[2] = array();             // labour
    $headlines[3] = array();             // price indices
    $headlines[4] = array();             // sales
    $headlines[5] = array();             // debt


    // Body copy for each item
    $copy =array();
    $copy[0] = '<span class="superscript">&dagger;</span>GDP is the Gross Domestic Product';
    $copy[1] = '<span class="superscript">&dagger;</span>BoP is the Balance of Payments';
    $copy[2] = '<span class="superscript">&dagger;</span>Labour is the Labout Market';
    $copy[3] = '<span class="superscript">&dagger;</span>Prices are the Retail Prices Indices';
    $copy[4] = '<span class="superscript">&dagger;</span>Sales is the UK\'s Total Sales by volume';
    $copy[5] = '<span class="superscript">&dagger;</span>Debt is the National Debt in £m';


    // Body copy for each item
    $offset =array();
    $offset[0] = 10;
    $offset[1] = 10;
    $offset[2] = 30;
    $offset[3] = 190;
    $offset[4] = 30;
    $offset[5] = 8;


    //create the html blocks
    $pageOpenA='
    <div id="';
    $pageOpenB='"  data-role="page" >';

    $headerA='
    <div data-role="header" data-position="" data-theme="a">
      <a href="#defaultpanel" class="ui-btn ui-shadow ui-corner-all ui-icon-menu ui-btn-icon-left ui-btn-icon-notext ui-nodisc-icon ui-btn-inline menu" ></a>
      <h1>';
      $headerB='</h1>
      <a href="#';
      $headerC='" class="ui-btn ui-shadow ui-corner-all ui-icon-arrow ui-btn-icon-right ui-btn-icon-notext ui-nodisc-icon ui-btn-inline"  data-transition="slide">Next</a>
    </div>';

    $headlines='
    <div class="item notes">
      <div class="row">
        <div class="alignleft">
          <div class="headline">£ 372529 m</div>
        </div>
        <div class="alignright">
          <div class="secondary alignright">-0.2%<span class="superscript">&dagger;</span></div>
          <div class="subtitle alignright">Chained Volume Measure</div>
        </div>
      </div>

      <div class="row">
        <div class="alignleft">
          <div class="headline">£ 375316 m</div>
        </div>
        <div class="alignright">
          <div class="secondary alignright">+0.3%<span class="superscript">&dagger;</span></div>
          <div class="subtitle alignright">Current Prices</div>
        </div>
      </div>
      <div class="row">
        <div class="alignleft">
          <div class="headline alignright">£ 6005</div>
        </div>
        <div class="alignright">
          <div class="secondary">&nbsp;</div>
          <div class="subtitle alignleft"> GDP per head</div>
        </div>
      </div>

    </div>

    ';


    $notesA='
    <div class="item footnote">
      <h5>Notes:</h5>
      <div id="" class="">
        <p>';

        // <span class="superscript">&dagger;</span> COPY GOES HERE. Shows the percentage change compared with the same month 12 months previously.
    $notesB='</p>
      </div>
    </div>

    ';


    $chartA='
    <div class="item">
      <h2>';
    $chartB='</h2>
      <div id="chart_';
    $chartC='" class="chart">
      </div>
    </div>

    ';


    $tableA='
    <div class="item">
      <h2>';
    $tableB='</h2>';


    $footer='
    <div class="item footnote">
      <h5> Note: </h5>
      <p>

        This is a prototype page looking to provide a summary of current economic statistics. We will be working to extend and enhance this page based on user feedback. If you have any feedback, comments or things you would like to see, please let us know at <a href="mailto:web.comments@ons.gsi.gov.uk">web.comments@ons.gsi.gov.uk</a>
      </p>
    </div>

    ';

    $bannerA = '

    <div id="" data-role="footer" class="item footer">
        <div >
          <img  class="" src="img/logo.png" />
        </div>
          <div class="alignright footnote black">Latest data extracted on ';
    $bannerB ='.</div>
      </div>
    
    ';


    $pageClose='

    </div><!-- /page -->';



echo '  <!-- Start of first page -->
  <div data-role="page" id="home"> 


    <div id=""  data-role="header" data-position="" data-theme="a">
      <!-- <a href="#defaultpanel" class="ui-btn ui-shadow ui-corner-all ui-icon-bars ui-btn-icon-notext" ></a> -->
      <a href="#defaultpanel" class="ui-btn ui-shadow ui-corner-all ui-icon-menu ui-btn-icon-left ui-btn-icon-notext ui-nodisc-icon ui-btn-inline menu"  data-transition="slide"></a>
      <h1>The Economy</h1>
      <!-- <a href="#gdp" class="ui-btn ui-shadow ui-corner-all ui-icon-carat-r ui-btn-icon-right ui-btn-icon-notext"  data-transition="slide">Next</a> -->
      <a href="#gdp" class="ui-btn ui-shadow ui-corner-all ui-icon-arrow ui-btn-icon-right ui-btn-icon-notext ui-nodisc-icon ui-btn-inline"  data-transition="slide">Next</a>
   <!--  <button class="ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-myicon">myicon</button> -->

    
 </a>



    </div>


    <div  id="" class="item notes" >
              
    <div class="container alpha-header">
      <p class="alpha-header-title">Office for National Statistics
        <span>Prototype</span>
      </p>
      <p class="alpha-header-copy">This is a prototype and does not contain the latest data. Please refer to <a href="http://www.ons.gov.uk">www.ons.gov.uk</a> for the latest information.</p>
    </div>

      <p>
        This snapshot shows key economic data.
      </p>
      <p>
        Headline figures are shown below, and are linked to more detailed data. Click the info button for more details.
      </p>

      <ul id="listview" data-role="listview" data-inset="true" data-theme="b">
        <li><a href="#gdp"  data-transition="slide">GDP: <span>£ ' . $data[0][0] . ' m</span></a></li>
        <li><a href="#bop"  data-transition="slide">BoP: <span> - £ ' . abs($data[5][0]) . ' m</span></a></li>
        <li><a href="#labour"  data-transition="slide">Labour: <span>' . $data[6][0] . '% employment | ' . $data[8][0] . '% unemployment</span></a></li>
        <li><a href="#prices" data-transition="slide" >Prices: <span>' . $data[13][0] . '% CPI | ' . $data[17][0] . '% RPIJ</span></a></li>
        <li><a href="#sales" data-transition="slide" >Sales: <span>' . $data[21][0] . '</span></a></li>
        <li><a href="#debt" data-transition="slide" >Debt: <span>£ ' . $data[24][0] . ' bn (' . $data[25][0] . '% GDP)</span></a></li>
      </ul>

      <h4> Note: </h4>
      <p>
        This is a prototype page looking to provide a summary of current economic statistics. We will be working to extend and enhance this page based on user feedback. If you have any feedback, comments or things you would like to see, please let us know at <a href="mailto:web.comments@ons.gsi.gov.uk">web.comments@ons.gsi.gov.uk</a>
      </p>
    </div>


  <div class="item">
  </div>';

 
  echo $bannerA . $extract . $bannerB;


  echo '

      </div><!-- /page -->';

  // loop through each group
  // create jqm page

  foreach ($titles as $item) {

    $numCols = count( $tables[$i] ) ;
    //echo($i ."::". $titles[$i] . ':' . $numCols . "\n");

    echo $pageOpenA . strtolower($titles[$i]) . $pageOpenB;

    $cdid = $tables[$i][0];

    // change date into something more readable
    $displayDate = explode (" ", $dates[$cdid][0] );
    $newDate = ucfirst(strtolower( $displayDate[1]) ) . " " . $displayDate[0];

    if($i<5){
      echo $headerA .$titles[$i] . ', <strong>' . $newDate ."</strong>". $headerB . strtolower($titles[$i+1]) . $headerC;

    }else{
      echo $headerA .$titles[$i] . ', <strong>' . $newDate ."</strong>" . $headerB . 'home' . $headerC;
    }

 

    switch($i){
      case 0:   // GDP
      $headlines='
      <div class="item notes">
        <div class="row">
          <div class="alignleft">
            <div class="headline">£ ' . $data[0][0] . ' m</div>
          </div>
          <div class="alignright">
            <div class="secondary alignright">' . $data[2][0] . '%<span class="superscript">&dagger;</span></div>
            <div class="subtitle alignright">Chained Volume Measure</div>
          </div>
        </div>

        <div class="row">
          <div class="alignleft">
            <div class="headline">£ ' . $data[1][0] . ' m</div>
          </div>
          <div class="alignright">
            <div class="secondary alignright">' . $data[3][0] . '%<span class="superscript">&dagger;</span></div>
            <div class="subtitle alignright">Current Prices</div>
          </div>
        </div>
        <div class="row">
          <div class="alignleft">
            <div class="headline alignright">£ ' . $data[4][0] . '</div>
          </div>
          <div class="alignright">
            <div class="secondary">&nbsp;</div>
            <div class="subtitle alignleft"> GDP per head</div>
          </div>
        </div>
            <div class="date"> '. $newDate . '</div>

      </div>

      ';
      break;
      case 1:
      $headlines='
      <div class="item notes">  
        <div class="row">
          <div class="headline">-£ ' . abs($data[5][0]) . ' m</div>
          <div class="subtitle alignright">Current Balance</div>
        </div>
            <div class="date"> '. $newDate . '</div>
      </div>

      ';

          


      break;
      case 2:
      $headlines='
        <div class="item notes">
         <div class="row">
           <div class="alignleft">
            <div class="headline">' . $data[6][0] . '</div>
            <div class="secondary">%</div>
          </div>
          <div class="alignright">
            <div class="subtitle alignright">Employment</div>
            <div class="subscript alignright">' . $data[7][0] . '</div>
          </div>
        </div>
        <div class="row">
          <div class="alignleft">
            <div class="headline">' . $data[8][0] . '</div>
            <div class="secondary">%</div>
          </div>
          <div class="alignright">
            <div class="subtitle alignright">Unemployment</div>
            <div class="subscript alignright">' . $data[9][0] . '</div>
          </div>
        </div>
        <div class="row">
          <div class="alignright">
            <div class="subtitle alignright">Claimants:</div>
            <div class="subscript alignright">' . $data[10][0] . '</div>
          </div>
        </div>
            <div class="date"> '. $newDate . '</div>
        <!-- <div class="date">Q4 2013</div> -->
      </div>

      ';
      break;

      case 3:
      $headlines='
         <div class="item notes">

            <div class="row">
              <div class="alignleft">
                <div class="headline">' . $data[13][0] . '</div>
                <div class="secondary">%</div>
                <div class="subtitle ">CPI (' . $data[14][0] . ' 2005)</div>
              </div>
              <div class="alignright">
                <div class="headline">' . $data[15][0] . '</div>
                <div class="secondary">%</div>
                <div class="subtitle ">CPIH (' . $data[16][0] . ' 2005)</div>
              </div>
            </div>
            <div class="row">
              <div class="alignleft">
                <div class="headline">' . $data[17][0] . '</div>
                <div class="secondary">%</div>
                <div class="subtitle ">RPIJ (' . $data[18][0] . ' 1987)</div>
              </div>
              <div class="alignright">
                <div class="headline">' . $data[19][0] . '</div>
                <div class="secondary">%</div>
                <div class="subtitle "> RPI (' . $data[20][0] . ' 1987)<span class="superscript">&dagger;</span>  </div>
              </div>
            </div>
            <div class="date"> '. $newDate . '</div>
          </div>

      ';

      break;
      case 4:
      $headlines='
        <div class="item notes">
          <div class="row">
            <div class="alignleftt">
              <div class="headline">' . $data[21][0] . '</div>
            </div>
            <div class="alignright">
              <div class="subscript">( Index, 2010 )</div>
              <div class="subtitle alignright">including Fuel</div>
            </div>
          </div>
          <div class="row">
           <div class="alignleft">
            <div class="headline">' . $data[22][0] . '</div>
          </div>
          <div class="alignright">
            <div class="subscript">( Index, 2010 )</div>
            <div class="subtitle alignright">excluding Fuel</div>
          </div>
        </div>
        <div class="row">
          <div class="alignleft">
            <div class="headline">£ ' . $data[23][0] . ' m</div>
          </div>
          <div class="alignright">
            <div class="subscript">&nbsp;</div>
            <div class="subtitle alignright">Consumer Spending</div>
          </div>
        </div>
            <div class="date"> '. $newDate . '</div>
      </div>

      ';
      break;
      case 5:
      $headlines='
        <div class="item notes">
          <div class="row">
            <div class="alignleft">
              <div class="headline">£ ' . $data[24][0] . ' bn</div>
            </div>
            <div class="alignright">
              <div class="subscript alignright">' . $data[25][0] . '% GDP</div>
              <div class="subtitle alignright">Current balance</div>
            </div>
          </div>
          <div class="row">
            <div class="alignleft">
              <div class="headline">£ ' . $data[26][0] . ' bn</div>
            </div>
            <div class="alignright">
              <div class="subscript alignright">' . $data[27][0] . '% GDP</div>
              <div class="subtitle alignright">excluding Financial Intervention</div>
            </div>
          </div>
            <div class="date"> '. $newDate . '</div>
        </div>

      ';
      break;

    }



    echo $headlines;
    echo $notesA . $copy[$i] . $notesB;
    echo $chartA . $fullTitles[$i] . $chartB. strtolower($titles[$i]) . $chartC;


    $numCharts = count( $charts[$i] ) ;
    $mainSeriesString='
          series: [';

    for ($col=0; $col<$numCharts; $col++){
      $column = $charts[$i][$col];
      $dataArray = $data[$column];


      $temp = array_reverse( $dataArray );

      $temp = implode( ",", $temp );

      $displayDates = implode( ",", $dates[$column] );
      $dateString = "'" . $dates[$column] [12] . "', '', '', '', '', '','". $dates[$column] [6]. "', '', '', '', '', '', '". $dates[$column] [0] . "'";


      $seriesString = '{
            name: "';
      $seriesString .= $names[$column] . '",
            data: [' ;
      $seriesString .= $temp;
      $seriesString .= ']';

      if( $column===2 || $column===3 || $column===4 || $column===6 || $column===8 || $column===14 || $column===16 || $column===18 || $column===20 || $column===23 || $column===25 || $column===27 ){
        $seriesString .= ',
      visible:false';
      }


      $seriesString .= '
                  },';

      $mainSeriesString .= $seriesString ;
    }

    $mainSeriesString = substr($mainSeriesString, 0, -1);
    $mainSeriesString .= ']


    ';

    //store the series data for that section to reuse as chart data
    $series[$i] = $mainSeriesString;
    $seriesDates[$i] = $dateString;


    echo $tableA. $fullTitles[$i] ." Data" .$tableB;

    $mode = "columntoggle";
    if($i===1 || $i>3){
      $mode = "";
    }
    echo "<table class='table' id='table_" . strtolower($titles[$i]) . "' data-role='table' data-mode='" . $mode . "' >\n";
    echo "<thead>\n";
    echo "<tr>\n";

    echo "<th>Date</th>\n";
    for ($col=0; $col<$numCols; $col++){
      $column = $tables[$i][$col];

      if($col%2===0){
        echo("<th>" . $names[$column] . "</th>\n");

      }else{
        echo("<th data-priority='3'>" . $names[$column] . "</th>\n");
        
      }
    }

    $len = count( $data[0] );


    echo "</tr>\n";
    echo "</thead>\n";
    echo "<tbody class='count_" . $len ."'>\n";


      // for each date item      
      for ($j=0; $j<$len; $j++){
          $row = "\t<tr>\n\t\t";
          $row .= "<td>" . $dates[$tables[$i][0]][$j] . "</td>";

          // loop through the series for each date
          for ($col=0; $col<$numCols; $col++){
            $column = $tables[$i][$col];

            if ( $data[$column][$j] ===NULL){
              $valStr="-";
            }else{
              $valStr=$data[$column][$j];
            }

             $row .= "<td>" . $valStr . "</td>";
          }

      $row .= "\n\t</tr>\n";
      echo $row;
      }


      echo "</tbody> \n";
      echo "</table> \n";
      echo "</div> \n";


    echo $footer;
    echo $bannerA . $extract . $bannerB;
    echo $pageClose;





					
      $i++;
	}
  // end of page html format


?>




<script>
  var charts = [];
  var width = 500;
  var height = 360;


  $(document).ready( function() {
    var wd =window.innerWidth;
    var ht = window.innerHeight;


    initCharts(wd-50);

  });


  $(window).resize(function() {
    resizeChart();
  });


  $( document ).on( "pageshow", function ( event, ui ) {
  var wd =window.innerWidth;
    var ht = window.innerHeight;
    // check orientation
    if(wd<ht && wd< 768){  //Portrait, so suggest...
      console.log("we respectfully suggest that you turn your screen around...");
    }else{

    }
  });


  $( document ).on( "pagecontainershow", function ( event, ui ) {
    var activePage = $.mobile.pageContainer.pagecontainer( "getActivePage" );
  });


  $( window ).on( "orientationchange", function( event ) {
    resizeChart();
    $( "#popupMenu" ).popup('close');
  });


  function resizeChart(){

    var wd =window.innerWidth;
    var ht = window.innerHeight;
    //var str = "";
    //var activePage = $.mobile.pageContainer.pagecontainer( "getActivePage" );
    //var id = activePage[0].id;
    //$("#"+id).append("change " + id + " to " + str + "<br/>");
    width = wd-20;

    //resize all charts
    jQuery.each($('.chart'), function(index, element) {
     chart = $('#'+element.id).highcharts();
     chart.setSize(width, height, false);
   });
  }


  function toggleCharts(event) {

    switch( this.index){

      case 0:
        var chart = $("#chart_gdp").highcharts();
        var series1 = chart.series[0];
        var series2 = chart.series[1];
        var series3 = chart.series[2];
        var series4 = chart.series[3];

        var title = "GDP (£ million)";

        if(series1.visible){
          series1.hide();
          series2.hide();
          series3.show();
          series4.show();

          title = "Percentage change (Qtr on Qtr)";
        }else{
          series1.show();
          series2.show();
          series3.hide();
          series4.hide();
        }
      break;

      case 1:
        
      break;

      case 2:
        var chart = $("#chart_labour").highcharts();
        var series1 = chart.series[0];
        var series2 = chart.series[1];
        var series3 = chart.series[2];
        var series4 = chart.series[3];
        var series5 = chart.series[4];
        var title = "Millions";

        if(series1.visible){
          series1.hide();
          series2.hide();
          series3.hide();
          series4.show();
          series5.show();
          title = "Percentage";
        }else{
          series1.show();
          series2.show();
          series3.show();
          series4.hide();
          series5.hide();
        }
      break;

      case 3:
        var chart = $("#chart_prices").highcharts();
        var series1 = chart.series[0];
        var series2 = chart.series[1];
        var series3 = chart.series[2];
        var series4 = chart.series[3];
        var series5 = chart.series[4];
        var series6 = chart.series[5];
        var series7 = chart.series[6];
        var series8 = chart.series[7];
        var title = "Indices (Consumer, 1987; Retail 2005))";

        if(series1.visible){
          series1.hide();
          series2.hide();
          series3.hide();
          series4.hide();
          series5.show();
          series6.show();
          series7.show();
          series8.show();
          title = "Percentage change";
        }else{
          series1.show();
          series2.show();
          series3.show();
          series4.show();
          series5.hide();
          series6.hide();
          series7.hide();
          series8.hide();
        }
      break;

      case 4:
        var chart = $("#chart_sales").highcharts();
        var series1 = chart.series[0];
        var series2 = chart.series[1];
        var series3 = chart.series[2];
        var title = "Index (2010)";

        if(series1.visible){
          series1.hide();
          series2.hide();
          series3.show();
          title = "Consumer Spending (£ million)";
        }else{
          series1.show();
          series2.show();
          series3.hide();
        }
      break;

      case 5:
        var chart = $("#chart_debt").highcharts();
        var series1 = chart.series[0];
        var series2 = chart.series[1];
        var series3 = chart.series[2];
        var series4 = chart.series[3];
        var title = "Net Debt (£bn)";

        if(series1.visible){
          series1.hide();
          series2.hide();
          series3.show();
          series4.show();
          title = "Net Debt (% GDP)";
        }else{
          series1.show();
          series2.show();
          series3.hide();
          series4.hide();
        }
      break;

    }

      chart.yAxis[0].axisTitle.attr({
          text: title
      });

      yAxis = chart.yAxis[0];
      titleWidth = yAxis.axisTitle.getBBox().width,

                    
      yAxis.update({
          title: {
            text: title,
           // offset: (-  title.length*3)
            offset:  -titleWidth
           
          }
      });
  }


  function initCharts(wd){

    Highcharts.setOptions({

      colors: [
              'rgb(0, 132, 209)',             // blue
              'rgb(255, 149, 14)',            // orange
              'rgb(255, 66, 14)',             // red
              'rgb(168, 189, 58)',            // green
              'rgb(144, 176, 201)',           // lt blue
              'rgb(255, 211, 32)',            // yellow
              'rgb(128, 128 , 128)' ,        // mid grey
              'rgb(65, 64, 66)',              // dk grey
              //'rgb(0, 61, 89)',             // dk grey
              // 'rgb(49, 64, 4)',            // dk grey
              //'rgb(204, 204, 204)'          // lt grey
              ],

      chart: {
        style: {
          fontFamily: 'Open Sans',
          color:'#000'
        },
        width:wd,
        height:height,
        marginTop:35,
        marginLeft:45,

        backgroundColor:'#F9F9F9',

        events: {
                  click: toggleCharts,

              load: function () {
                  var chart = this,
                      yAxis = chart.yAxis[0],
                      titleWidth = yAxis.axisTitle.getBBox().width;
                  yAxis.update({
                      title: {
                          offset: -titleWidth
                      }
                  });
              }

              
          }

      },
      symbols: [
      'circle'
      ]
      ,
       title: {
                text: ' '
              },
              subtitle: {
                text: ''
              }
      ,
      plotOptions: {
        series: {
          animation: false
      },
        line: {
          marker: {
           radius: 4,
           fillColor: '#fff',
           lineColor: null,
           lineWidth: 2
         },
         shadow:true
         ,
         dataLabels: {
          enabled: false
        },
        enableMouseTracking: false
      }
    },
    yAxis: {

      title: {
                align: 'high',
            
                rotation: 0,
                y: -15,
                
                

                style: {
                  color: '#000',
                  fontWeight:300
                }

              }


    },
    legend: {
      borderColor:null,
      borderRadius: 0,
      borderWidth: 1
    },
    credits:{
      enabled:false
    }
  });


<?php

  $i = 0;

    foreach ($titles as $item) {
      echo "
      charts['";
      echo strtolower($titles[$i]);
      echo "'] = $('#chart_";
      echo strtolower($titles[$i]);
      echo "').highcharts({
        chart: {
          type: 'line'
        },
        xAxis: {
          categories: [";
      echo $seriesDates[$i];
      echo    "]
        },
        yAxis: {
          title: {
            text: '";
      echo $yAxis[$i] ;
      echo "',
            offset: -";

      echo $offset[$i];
      echo "     ,
            style: {
              color: '#000'
            }
          }

        },";

      echo 
        "";

      echo $series[$i] ;

      echo "  });";

      $i++;
      
    }

?>

}


</script>

</body>
</html>