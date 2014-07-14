<?php


	// create a mySQL connection
	$db    		= 'ons_dataset';
	$dbhost		= 'localhost';
	$dbuser		= 'root';
	$dbpass		= 'root';


	$table = 'nationalaccounts';

	if (isset($_GET{'t'})) {
		if(preg_match("/[A-Z | a-z]+/", $_GET['t'])){
			$table = $_GET{'t'};
		}
	}

	if (isset($_GET{'ds'})) {
		if(preg_match("/[A-Z | a-z]+/", $_GET['ds'])){
			$ds = $_GET{'ds'};
		}
	}


	// set the record limit
	$rec_limit = 9000;

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


	if (isset($_GET{'page'})) {
		$page   = $_GET{'page'} + 1;
		$offset = $rec_limit * $page;
	} else {
		$page   = 0;
		$offset = 0;
	}


	$left_rec = $rec_count - ($page * $rec_limit);

	if (isset($_GET{'ds'})) {
		$ds = $_GET{'ds'};
		$sql = "SELECT * " . "FROM " . $table . " WHERE Dataset='" . $ds . "'";
	}
	else{
		$sql = "SELECT * " . "FROM " . $table . " LIMIT $offset, $rec_limit";
	}


	$retval = mysql_query($sql, $conn);
	if (!$retval) {
		die('Could not get TABLE data: ' . mysql_error());
	}

	$numrows=mysql_num_rows($retval);
	echo ('{ "aaData": [');

	$i = 1;
	while ($row = mysql_fetch_array($retval, MYSQL_ASSOC)) {

		echo '[';
		echo '"' . $row['CDID'] . '",';
		echo '"' .utf8_encode( $row['Description'] ) . '",';
		echo '"' . $row['SA'] . '",';
		echo '"' . $row['BasePeriod'] . '",';
		echo '"' . $row['Price'] . '",';
		echo '"' . $row['IndexPeriod'] . '", ';
		echo '"' . $row['Dataset'] . '"';
		echo ']';
		if ($i < $numrows)
		{
			echo ',';
		}

		$i ++;
	}

	echo ']}';
	mysql_close($conn);

?>