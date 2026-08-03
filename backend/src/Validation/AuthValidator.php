<?php
declare(strict_types=1);
namespace App\Validation;

final class AuthValidator {
 public static function login(array $in):array{return self::only($in,['email','password'],function()use($in){$email=mb_strtolower(trim((string)($in['email']??'')));$password=(string)($in['password']??'');$e=[];if(!filter_var($email,FILTER_VALIDATE_EMAIL)||mb_strlen($email)>254)$e['email']='Enter a valid email address.';if($password==='')$e['password']='Enter your password.';return[$e?null:['email'=>$email,'password'=>$password],$e];});}
 public static function invite(array $in):array{return self::only($in,['name','email'],function()use($in){$name=trim((string)($in['name']??''));$email=mb_strtolower(trim((string)($in['email']??'')));$e=[];if(mb_strlen($name)<1||mb_strlen($name)>80||self::controls($name))$e['name']='Enter a name of 1 to 80 characters.';if(!filter_var($email,FILTER_VALIDATE_EMAIL)||mb_strlen($email)>254)$e['email']='Enter a valid email address.';return[$e?null:['name'=>$name,'email'=>$email],$e];});}
 public static function password(array $in):array{return self::only($in,['password'],function()use($in){$p=(string)($in['password']??'');$e=[];if(strlen($p)<12)$e['password']='Use at least 12 characters.';elseif(strlen($p)>128)$e['password']='Use 128 characters or fewer.';elseif(!preg_match('/[a-z]/',$p)||!preg_match('/[A-Z]/',$p)||!preg_match('/\d/',$p))$e['password']='Include uppercase, lowercase, and a number.';return[$e?null:['password'=>$p],$e];});}
 private static function only(array $in,array $allowed,callable $validate):array{if(array_diff(array_keys($in),$allowed))return[null,['form'=>'Unexpected fields were provided.']];return$validate();}
 private static function controls(string $v):bool{return(bool)preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',$v);}
}
