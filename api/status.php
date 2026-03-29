<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
// Static status — no auto-deploy on shared hosting
echo json_encode(['updating' => false, 'lastUpdate' => null, 'message' => '']);
