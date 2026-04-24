<?php
header('Content-Type: application/json; charset=utf-8');
$dir = __DIR__ . '/projects';
if (!is_dir($dir)) mkdir($dir, 0775, true);
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Niepoprawny JSON']); exit; }
$name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['name'] ?? ('project_' . date('Ymd_His')));
$file = $dir . '/' . $name . '.json';
file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo json_encode(['ok'=>true,'url'=>'projects/'.basename($file)]);
