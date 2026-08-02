<?php
declare(strict_types=1);
namespace App\Database;
use App\Config\Env;use PDO;
final class Connection {public static function create():PDO {$dsn=sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',Env::get('DB_HOST'),Env::get('DB_PORT','3306'),Env::get('DB_DATABASE'));return new PDO($dsn,Env::get('DB_USERNAME'),Env::get('DB_PASSWORD'),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_STRINGIFY_FETCHES=>false]);}}
