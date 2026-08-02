<?php
declare(strict_types=1);
namespace App\Http;
final class Request {public static function json():array {$type=strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]));if($type!=='application/json')JsonResponse::error('Content-Type must be application/json.',415);$raw=file_get_contents('php://input');if($raw===false||strlen($raw)>16384)JsonResponse::error('Request body is too large.',413);try{$data=json_decode($raw,true,32,JSON_THROW_ON_ERROR);}catch(\JsonException){JsonResponse::error('Invalid JSON request.',400);}if(!is_array($data)||array_is_list($data))JsonResponse::error('JSON body must be an object.',400);return $data;}}
