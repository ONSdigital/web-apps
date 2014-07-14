<?php

	header('Content-type: application/json', true);

	// create a mySQL connection
	$db    		= 'ons_dataset';
	$dbhost		= 'localhost';
	$dbuser		= 'root';
	$dbpass		= 'root';


	$table    = $_GET['table'];

	$errorList = array( );

	$conn = mysql_connect($dbhost, $dbuser, $dbpass);
	if (!$conn) {
		die('Could not connect: ' . mysql_error());
	}

	mysql_select_db($db);

	if(preg_match("/[A-Z | a-z]+/", $_GET['cdid'])){
		$cdid=$_GET['cdid'];

		$list = explode(',', $cdid);

		// connect to the database
		$db=mysql_connect ($dbhost, $dbuser, $dbpass) or die ('I cannot connect to the database because: ' . mysql_error()); 

		// select the database to use
		$mydb=mysql_select_db("ons_dataset");

		// query the database table
		foreach($list as $item)
		{
			$sql="select Description FROM " . $table . " WHERE CDID = '". $item ."'";

			// run the query against the mysql query function
			$result=mysql_query($sql);

			$numrows = 0;

			if($result){
				$numrows=mysql_num_rows($result);
			}else{
				array_push($errorList, $item);
			}
			

			if($numrows==0){
				array_push($errorList, $item);

			}
		}


		mysql_close($conn);

		echo "{"; 
		echo '"number":"' . count($errorList) .  '",'; 
		echo '"cdid":'; 

		if( count($errorList)>0 ){
			echo(json_encode($errorList) );
		}else{
			echo '"none"';
		}

		echo "}"; 

	}

?>