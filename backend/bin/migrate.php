<?php
declare(strict_types=1);

use App\Config\Env;
use App\Database\Connection;

$autoload=dirname(__DIR__).'/vendor/autoload.php';require is_file($autoload)?$autoload:dirname(__DIR__).'/autoload.php';
Env::load(dirname(__DIR__).'/.env');
$db=Connection::create();

function executeSqlFile(PDO $db,string $file):void{
 $sql=file_get_contents($file);if($sql===false)throw new RuntimeException("Cannot read $file");
 $sql=preg_replace('/^CREATE DATABASE[^;]+;\s*/mi','',$sql);$sql=preg_replace('/^USE\s+[^;]+;\s*/mi','',$sql);
 foreach(array_filter(array_map('trim',preg_split('/;\s*(?:\r?\n|$)/',$sql)?:[])) as $statement)$db->exec($statement);
}

$hasUsers=(bool)$db->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='users'")->fetchColumn();
if(!$hasUsers){executeSqlFile($db,dirname(__DIR__).'/database/schema.sql');echo "Base schema created.\n";}
$hasRole=(bool)$db->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='role'")->fetchColumn();
if(!$hasRole){executeSqlFile($db,dirname(__DIR__).'/database/migration_002_auth_budgets.sql');echo "Authentication and budget migration applied.\n";}

$pending=(int)$db->query("SELECT COUNT(*) FROM invitations WHERE role='admin' AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at>NOW()")->fetchColumn();
$activated=(int)$db->query("SELECT COUNT(*) FROM users WHERE role='admin' AND password_hash IS NOT NULL")->fetchColumn();
if($activated===0&&$pending===0){$token=bin2hex(random_bytes(32));$hash=hash('sha256',$token);$s=$db->prepare("INSERT INTO invitations(email,name,token_hash,role,invited_by,expires_at) SELECT email,name,:hash,'admin',NULL,DATE_ADD(NOW(),INTERVAL 48 HOUR) FROM users WHERE id=1");$s->execute(['hash'=>$hash]);echo "ADMIN_ACTIVATION_URL=".rtrim(Env::get('APP_ORIGIN'),'/')."/invite?token=$token\n";}
echo "Migrations complete.\n";
