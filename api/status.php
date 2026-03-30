<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Try to get the last git commit timestamp; fall back to the newest game.json mtime
$lastUpdate = null;

$gitDate = shell_exec('git -C ' . escapeshellarg(__DIR__ . '/..') . ' log -1 --format=%cI HEAD 2>/dev/null');
if ($gitDate && trim($gitDate) !== '') {
    $lastUpdate = trim($gitDate);
} else {
    // Fallback: most-recently-modified game.json
    $gamesDir = __DIR__ . '/../games';
    $newest = 0;
    if (is_dir($gamesDir)) {
        foreach (scandir($gamesDir) as $entry) {
            $f = "$gamesDir/$entry/game.json";
            if (is_file($f)) {
                $mt = filemtime($f);
                if ($mt > $newest) $newest = $mt;
            }
        }
    }
    if ($newest > 0) {
        $lastUpdate = date('c', $newest);
    }
}

echo json_encode(['updating' => false, 'lastUpdate' => $lastUpdate, 'message' => '']);
