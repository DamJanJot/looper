<?php
header('Content-Type: application/json; charset=utf-8');
$dir = __DIR__ . '/assets/uploads';
if (!is_dir($dir)) mkdir($dir, 0775, true);
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['audio'])) {
  http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Brak pliku audio']); exit;
}
$f = $_FILES['audio'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['wav','webm','ogg','mp3','m4a'])) $ext = 'webm';
$name = 'loop_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
$target = $dir . '/' . $name;
if (!move_uploaded_file($f['tmp_name'], $target)) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'Nie udało się zapisać']); exit; }
echo json_encode(['ok'=>true,'url'=>'assets/uploads/'.$name,'name'=>$name]);
