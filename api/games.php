<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$gamesDir = __DIR__ . '/../games';
$games = [];

if (is_dir($gamesDir)) {
    foreach (scandir($gamesDir) as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $metaFile = "$gamesDir/$entry/game.json";
        if (is_file($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true);
            if ($meta && empty($meta['hidden'])) {
                $meta['id'] = $entry;
                $games[] = $meta;
            }
        }
    }
}

echo json_encode($games);
