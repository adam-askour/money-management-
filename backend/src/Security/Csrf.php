<?php
declare(strict_types=1);
namespace App\Security;
final class Csrf {public static function token():string{return $_SESSION['csrf']??=bin2hex(random_bytes(32));}public static function verify():void{$sent=$_SERVER['HTTP_X_CSRF_TOKEN']??'';if(!is_string($sent)||!hash_equals(self::token(),$sent))\App\Http\JsonResponse::error('Security token validation failed.',403);}}
