<?php
declare(strict_types=1);
namespace App\Database;
use App\Config\Env;use PDO;
final class Connection {public static function create():PDO {$dsn=sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',Env::get('DB_HOST'),Env::get('DB_PORT','3306'),Env::get('DB_DATABASE'));$options=[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_STRINGIFY_FETCHES=>false];if(Env::get('DB_SSL_REQUIRED','false')==='true'){$ca=Env::get('DB_SSL_CA_CERT','');$caPath='/etc/ssl/certs/ca-certificates.crt';if($ca!==''){$caPath=sys_get_temp_dir().'/daily-dh-mysql-ca.crt';if(!is_file($caPath)||file_get_contents($caPath)!==$ca)file_put_contents($caPath,$ca,LOCK_EX);}$options[PDO::MYSQL_ATTR_SSL_CA]=$caPath;$options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT]=true;}return new PDO($dsn,Env::get('DB_USERNAME'),Env::get('DB_PASSWORD'),$options);}}
