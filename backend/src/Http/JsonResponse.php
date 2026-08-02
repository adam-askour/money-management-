<?php
declare(strict_types=1);
namespace App\Http;
final class JsonResponse {
 public static function success(mixed $data,int $status=200):never {self::send(['ok'=>true,'data'=>$data],$status);}
 public static function error(string $message,int $status,array $fields=[]):never {$error=['message'=>$message];if($fields)$error['fields']=$fields;self::send(['ok'=>false,'error'=>$error],$status);}
 private static function send(array $payload,int $status):never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($payload,JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
}
