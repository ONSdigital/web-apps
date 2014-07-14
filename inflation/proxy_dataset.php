<?php

	header('Content-type: application/json');

	$feed = "http://www.ons.gov.uk/ons/datasets-and-tables/downloads/csv.csv";
	$dataset = $_GET["dataset"];
	//Example $dataset = "lms";
	$cdid = strtoupper( $_GET["cdid"] );
	//Example $cdid = "YBXF,YBXU";


	$feed = $feed . "?dataset=" . $dataset . "&cdid=" . $cdid;


	$c = curl_init($feed);
	curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($c);
	echo $result;
	curl_close($c);

 
?>