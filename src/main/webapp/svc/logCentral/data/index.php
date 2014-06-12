<?php
header('Content-type: application/json');
$rows = 
	array(
		array( 'blogMsgId' => '01', 'date' => '11:25', 'author' => 'Emma', 'link' => 'http://bla/xxx.pdf', 'msg' => 'Did you read it???', 'img' => 'img/x01.png' ),
		array( 'blogMsgId' => '02', 'date' => '11:27', 'author' => 'Sam', 'link' => 'http://bla/yyy.pdf', 'msg' => 'What???', 'img' => 'img/x02.png' ),
		array( 'blogMsgId' => '03', 'date' => '11:28', 'author' => 'Emma', 'link' => 'http://bla/yyy.pdf', 'msg' => 'My article on the tech blog?', 'img' => 'img/x03.png' ),
		array( 'blogMsgId' => '04', 'date' => '11:35', 'author' => 'Joe', 'link' => 'http://bla/yyy.pdf', 'msg' => 'Yes, now I understand a lot more the details! Thanks!', 'img' => 'img/x04.png' ),
		array( 'blogMsgId' => '05', 'date' => '11:38', 'author' => 'M.M.', 'link' => 'http://bla/yyy.pdf', 'msg' => 'really good explained -- love it', 'img' => 'img/x03.png' ),
		array( 'blogMsgId' => '06', 'date' => '12:10', 'author' => 'Emma', 'link' => 'http://bla/yyy.pdf', 'msg' => 'OK, i plan to post an other howto on the tech blog -- will be available until EOB.', 'img' => 'img/x03.png' ),
	);

echo json_encode( $rows );
?>

