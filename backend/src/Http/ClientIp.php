<?php
declare(strict_types=1);
namespace App\Http;

final class ClientIp {
 public static function detect(bool $trustProxyHeaders=false):string{$remote=$_SERVER['REMOTE_ADDR']??'unknown';if(!$trustProxyHeaders)return self::valid($remote);$forwarded=$_SERVER['HTTP_X_FORWARDED_FOR']??'';foreach(array_map('trim',explode(',',$forwarded)) as $candidate){if(filter_var($candidate,FILTER_VALIDATE_IP,FILTER_FLAG_NO_PRIV_RANGE|FILTER_FLAG_NO_RES_RANGE)!==false)return$candidate;}return self::valid($remote);}
 private static function valid(string $value):string{return filter_var($value,FILTER_VALIDATE_IP)!==false?$value:'unknown';}
}
