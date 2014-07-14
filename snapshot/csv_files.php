<?php
//create a mySQL connection

$db    = 'ons_dataset';
$dbhost    = 'localhost';
$dbuser    = 'root';
$dbpass    = 'root';


$table = 'Series';

echo('loading data...<br/>');

/*
$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $db);
$result = $mysqli->query("SELECT count(CDID) FROM " . $table);
$row = $result->fetch_assoc();
echo htmlentities($row['_message']);

$db = new mysqli('localhost', 'user', 'pass', 'demo');

if($db->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
}
*/


$conn = mysql_connect($dbhost, $dbuser, $dbpass);
if (!$conn) {
	die('Could not connect: ' . mysql_error());
}

mysql_select_db($db);

// Get total number of records 
$sql    = "SELECT count(CDID) FROM " . $table;
$retval = mysql_query($sql, $conn);
if (!$retval) {
	die('Could not get data: ' . mysql_error());
}
$row       = mysql_fetch_array($retval, MYSQL_NUM);
$rec_count = $row[0];





	$ds = "LMS";


	// pull the data from the 'Series' table

	$datasets = "SELECT * FROM " . $table ;//." GROUP BY Dataset"; 
	$retval = mysql_query($datasets, $conn);
	if (!$retval) {
		die('Could not get TABLE data: ' . mysql_error());
	}

	$numrows=mysql_num_rows($retval);

	$dict = array();
	$dataset = array();
	$dates = array();
	$period = array();
/*
	$dict["QNA"] = array();
	$dict["LMS"] = array();
	$dict["DRSI"] = array();
	$dict["PNBP"] = array();
	$dict["PUSF"] = array();
	$dict["UKEA"] = array();
	$dict["MM23"] = array();
	$dict["CT"] = array();
*/
	while ($row = mysql_fetch_array($retval, MYSQL_ASSOC)) {

		$ds =  $row['Dataset'];
		$id =  $row['CDID'];

		if(!isset( $dict[ $ds ] )){
			$dict[ $ds ] = array();
		}

		// create arrays to hold a list of data and dates
		if(!isset( $dataset[ $id ] )){
			$dataset[ $id ] = array();
			$dates[ $id ] = array();
			$period[ $id ] = "";
		}

		array_push( $dict[ $ds ] , $row['CDID'] );
		$period[ $id ] = $row['Period'] ;
	}



	$url = "";

	// loop through each dataset and call ONS site for the CSV containing the list of CDIDs

	// process the csv
	// load the csv for each dataset
	// sort into quarterly and monthly data
	// keep the last twelve values

	foreach ($dict as $key => $value) {

	$quarter_base = array();
	$month_base = array();
	$quarter = array();
	$month = array();
		
		$comma_separated = implode(",", $value);
		//$url = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv?dataset=" . strtolower($key) . "&cdid=".$comma_separated;
		//$url = "http://localhost/snapshot/data/" . $key . "_CSDB_DS.csdb.csv";//&cdid=".$comma_separated;
		$url = "data/" . $key . "_CSDB_DS.csdb.csv";//&cdid=".$comma_separated;
	  	echo '<br>' . $url . "<br>";

		$row = 1;
		// make sure the remote file is successfully opened before doing anything else

			if (($handle = fopen($url, "r")) !== FALSE) {
			    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {

		            if( $row==1) {
		            // keep the CDID refs from the first row
					   $firstRow = $data;
					   array_shift($firstRow);
		            }

		            if( strlen($data[0])==7) {
		            	//echo 'QUARTER:' . $data[0] . '<br>';
		            	array_push( $quarter_base , $data );
		            }else
		            if( strlen($data[0])==8) {
		            	//echo'MONTH<br>';
		            	array_push( $month_base , $data );
		            }

			       $row++;

			    }
			    fclose($handle);



		   // keep the CDID refs from the first row
		   //array_push( $month_base , $firstRow );
		   //array_push( $quarter_base , $firstRow );

			// once we have a list of the quartery values then revese the array and take last 13 values
			$month = array_reverse($month_base);
			$quarter = array_reverse($quarter_base);



		   $month = array_slice($month,0,13);
		   $quarter = array_slice($quarter,0,13);

		} else {
		   // an error occured when trying to open the specified url
			echo 'There was a problem with ' . $url;
		}



		//build list based on data


		//start count at 1 as the first column of data is the date
		$count=1;
		 foreach ($firstRow as $value) {

		 	echo "DATASET HAS  " . $value ."|" ;

		 	//build list of date based on period
		 	if($value){
		 	echo " with period ". $period[$value] ."<br>" ;

				 	
		 	

			 	if($period[$value]=="Q"){
			 		echo 'GET QUARTERLY DATA FOR ' . $value . '<br>';
			 		foreach ($quarter as $datum) {
					 	$txt = implode(",", $datum);
					 	echo "Q " . $txt . ':'. $datum[$count]. ':' . $count . "<br>" ;
					 	
					 	array_push( $dataset[$value] , $datum[$count] );
					 	array_push( $dates[$value] , $datum[0] );
					 }

			 	}else if($period[$value]=="M"){
			 		echo 'GET MONTHLY DATA FOR ' . $value . '<br>';
					foreach ($month as $datum) {
					 	$txt = implode(",", $datum);
					 	echo "M " . $txt . ':'. $datum[$count]. ':' . $count . "<br>" ;
					 	
					 	array_push( $dataset[$value] , $datum[$count] );
					 	array_push( $dates[$value] , $datum[0] );
					 }
			 	}else{
			 		echo"ERROR FINDING TIME PERIOD";
			 	}

			 	
		 	}
			$count++;
		 }

	}

		$today = date("d.m.Y");
		//$dates_separated = implode(",", $dates);
		echo '<br>__________________________<br>' ;
		echo 'WRITE DATA TO DATABASE: ' . $today . ' <br>' ;
		//echo 'WRITE DATES TO DATABASE: ' . $dates_separated . ' <br>' ;
		//echo '(Currrently commented out) <br>' ;

		foreach ($dataset as $key=>$value) {
			$comma_separated = implode(",", $value);
			// get corresponding date
			$dates_separated = implode(",", $dates[$key] );
			echo $key .": ". $comma_separated ."::" . $dates_separated  .  "<br>";

			$sql    = "UPDATE Series SET Data='". $comma_separated . "', Dates='" . $dates_separated  . "', extractDate='" . $today . "' WHERE CDID='" . $key ."'";
			$retval = mysql_query($sql, $conn);
		}


mysql_close($conn);


?>