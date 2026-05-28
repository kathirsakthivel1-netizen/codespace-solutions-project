<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$json_file = 'products.json';

if (file_exists($json_file)) {
    $data = file_get_contents($json_file);
    echo $data;
} else {
    http_response_code(404);
    echo json_encode(["error" => "Products data not found."]);
}
?>
