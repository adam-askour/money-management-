<?php
declare(strict_types=1);
namespace App\Config;
final class Env {
 public static function load(string $file):void { if(!is_file($file))return; foreach(file($file,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES)?:[] as $line){if(str_starts_with(trim($line),'#')||!str_contains($line,'='))continue;[$key,$value]=array_map('trim',explode('=',$line,2));$value=trim($value,"\"'");if(getenv($key)===false){putenv("$key=$value");$_ENV[$key]=$value;}}}
 public static function get(string $key,?string $default=null):string {$value=getenv($key);if($value===false)$value=$default;if($value===null)throw new \RuntimeException("Missing required configuration: $key");return $value;}
}
