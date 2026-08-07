<?php
declare(strict_types=1);

use App\Config\Env;
use App\Database\Connection;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Http\ClientIp;
use App\Repositories\AuthRepository;
use App\Repositories\MoneyRepository;
use App\Security\Csrf;
use App\Security\RateLimiter;
use App\Services\AuthService;
use App\Services\DatePolicy;
use App\Services\MoneyService;
use App\Validation\AuthValidator;
use App\Validation\BudgetValidator;
use App\Validation\ExpenseValidator;

$autoload=dirname(__DIR__).'/vendor/autoload.php';require is_file($autoload)?$autoload:dirname(__DIR__).'/autoload.php';
Env::load(dirname(__DIR__).'/.env');
if(Env::get('APP_ENV','development')==='production'){ini_set('display_errors','0');ini_set('log_errors','1');}

$allowedOrigins=array_values(array_filter(array_map('trim',explode(',',Env::get('APP_ORIGINS',Env::get('APP_ORIGIN','http://localhost:5173'))))));
$origin=$_SERVER['HTTP_ORIGIN']??'';
if($origin!==''&&in_array($origin,$allowedOrigins,true)){header("Access-Control-Allow-Origin: $origin");header('Access-Control-Allow-Credentials: true');header('Vary: Origin');}
elseif($origin!==''){JsonResponse::error('Origin is not allowed.',403);}
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');header('Permissions-Policy: camera=(), microphone=(), geolocation=()');header('Cross-Origin-Resource-Policy: same-site');header('Cache-Control: no-store');header('X-Frame-Options: DENY');
if(($_SERVER['REQUEST_METHOD']??'GET')==='OPTIONS'){header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Idempotency-Key');http_response_code(204);exit;}

$secure=Env::get('APP_ENV','development')==='production';
$sessionLifetime=max(86400,(int)Env::get('APP_SESSION_LIFETIME_SECONDS','7776000'));
session_name(Env::get('APP_SESSION_NAME','adam_money_session'));
session_set_cookie_params(['lifetime'=>$sessionLifetime,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
ini_set('session.use_strict_mode','1');
ini_set('session.gc_maxlifetime',(string)$sessionLifetime);
session_start();
$now=time();
if(isset($_SESSION['last_seen'])&&($now-(int)$_SESSION['last_seen'])>$sessionLifetime){$_SESSION=[];session_regenerate_id(true);}
$_SESSION['created_at']??=$now;$_SESSION['last_seen']=$now;

$db=Connection::create();$authRepo=new AuthRepository($db);$auth=new AuthService($authRepo,50);
$ip=ClientIp::detect(Env::get('TRUST_PROXY_HEADERS','false')==='true');$secret=Env::get('RATE_LIMIT_SECRET',Env::get('DB_PASSWORD','development-rate-limit-secret'));
$ipHash=hash_hmac('sha256',$ip,$secret);$limiter=new RateLimiter($db,$secret);
$general=$limiter->hit('general',$ip,240,60,60);if(!$general['allowed']){header('Retry-After: '.$general['retryAfter']);JsonResponse::error('Too many requests. Please wait and try again.',429);}

$method=$_SERVER['REQUEST_METHOD']??'GET';$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);$path=preg_replace('#^/api#','',$path)?:'/';
$timezone=new DateTimeZone(Env::get('APP_TIMEZONE','Africa/Casablanca'));

try{
 if($method==='GET'&&$path==='/health'){$db->query('SELECT 1');JsonResponse::success(['status'=>'healthy']);}
 if($method==='GET'&&$path==='/bootstrap')JsonResponse::success(['csrfToken'=>Csrf::token(),'timezone'=>$timezone->getName(),'user'=>$auth->current()]);
 if($method==='POST'&&$path==='/auth/login'){Csrf::verify();$body=Request::json();[$valid,$errors]=AuthValidator::login($body);if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$key=$ip.'|'.$valid['email'];$rate=$limiter->hit('login',$key,5,900,900);if(!$rate['allowed']){header('Retry-After: '.$rate['retryAfter']);JsonResponse::error('Too many login attempts. Try again later.',429);}try{$user=$auth->login($valid['email'],$valid['password'],$ipHash);JsonResponse::success(['user'=>$user,'csrfToken'=>Csrf::token()]);}catch(DomainException){usleep(random_int(180000,320000));JsonResponse::error('Invalid email or password.',401);}}
 if($method==='POST'&&$path==='/auth/logout'){Csrf::verify();$current=$auth->current();$auth->logout($current['id']??null,$ipHash);session_start();JsonResponse::success(['csrfToken'=>Csrf::token()]);}
 if($method==='GET'&&preg_match('#^/invitations/([a-f0-9]{64})$#',$path,$m)){$rate=$limiter->hit('invite_view',$ip,20,3600,3600);if(!$rate['allowed'])JsonResponse::error('Too many invitation requests.',429);JsonResponse::success($auth->invitation($m[1]));}
 if($method==='POST'&&preg_match('#^/invitations/([a-f0-9]{64})/accept$#',$path,$m)){Csrf::verify();$rate=$limiter->hit('invite_accept',$ip,8,3600,3600);if(!$rate['allowed'])JsonResponse::error('Too many attempts. Try again later.',429);[$valid,$errors]=AuthValidator::password(Request::json());if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$user=$auth->accept($m[1],$valid['password'],$ipHash);JsonResponse::success(['user'=>$user,'csrfToken'=>Csrf::token()]);}

 $user=$auth->current();if(!$user)JsonResponse::error('Authentication required.',401);
 $manualDates=array_values(array_filter(array_map('trim',explode(',',Env::get('MANUAL_EDITABLE_DATES','')))));
 $service=new MoneyService(new MoneyRepository($db),new DatePolicy($timezone,null,$manualDates,$user['activationDate']),$user['id'],$user['activationDate']);

 if($method==='GET'&&preg_match('#^/months/(\d{4}-\d{2})$#',$path,$m))JsonResponse::success($service->month($m[1]));
 if($method==='GET'&&preg_match('#^/days/(\d{4}-\d{2}-\d{2})$#',$path,$m))JsonResponse::success($service->day($m[1]));
 if($method==='GET'&&$path==='/admin/users'){$admin=$auth->requireAdmin();JsonResponse::success(['users'=>$authRepo->users(),'invitations'=>$authRepo->invitations(),'limit'=>50,'used'=>$authRepo->countUsers(),'currentUserId'=>$admin['id']]);}
 if(!in_array($method,['GET','HEAD','OPTIONS'],true))Csrf::verify();
 if($method==='POST'&&$path==='/admin/invitations'){$admin=$auth->requireAdmin();[$valid,$errors]=AuthValidator::invite(Request::json());if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$result=$auth->invite($valid,$admin['id']);$base=rtrim(Env::get('APP_ORIGIN','http://localhost:5173'),'/');JsonResponse::success(['inviteUrl'=>$base.'/invite?token='.$result['token'],'expiresAt'=>$result['expiresAt']],201);}
 if($method==='DELETE'&&preg_match('#^/admin/invitations/(\d+)$#',$path,$m)){$auth->requireAdmin();if(!$authRepo->deleteInvitation((int)$m[1]))JsonResponse::error('Invitation not found or no longer pending.',404);JsonResponse::success(['deleted'=>true]);}
 if($method==='DELETE'&&preg_match('#^/admin/users/(\d+)$#',$path,$m)){$admin=$auth->requireAdmin();if(!$authRepo->deleteUser((int)$m[1],$admin['id']))JsonResponse::error('User not found.',404);JsonResponse::success(['deleted'=>true]);}
 if($method==='PATCH'&&preg_match('#^/admin/users/(\d+)$#',$path,$m)){$admin=$auth->requireAdmin();$body=Request::json();if(array_keys($body)!==['isActive']||!is_bool($body['isActive']))JsonResponse::error('A valid isActive value is required.',422);if(!$authRepo->setActive((int)$m[1],$body['isActive'],$admin['id']))JsonResponse::error('User not found.',404);JsonResponse::success(['updated'=>true]);}
 if($method==='PATCH'&&$path==='/budget'){[$valid,$errors]=BudgetValidator::validate(Request::json());if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$service->setBudget($valid);JsonResponse::success(['updated'=>true]);}
 if($method==='POST'&&preg_match('#^/days/(\d{4}-\d{2}-\d{2})/expenses$#',$path,$m)){[$valid,$errors]=ExpenseValidator::validate(Request::json());if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$key=$_SERVER['HTTP_IDEMPOTENCY_KEY']??bin2hex(random_bytes(16));if(!preg_match('/^[A-Za-z0-9_-]{16,80}$/',$key))JsonResponse::error('Invalid idempotency key.',400);JsonResponse::success($service->add($m[1],$valid,$key),201);}
 if($method==='PATCH'&&preg_match('#^/expenses/(\d+)$#',$path,$m)){[$valid,$errors]=ExpenseValidator::validate(Request::json());if($errors)JsonResponse::error('Please correct the highlighted fields.',422,$errors);$service->update((int)$m[1],$valid);JsonResponse::success(['updated'=>true]);}
 if($method==='DELETE'&&preg_match('#^/expenses/(\d+)$#',$path,$m)){$service->delete((int)$m[1]);JsonResponse::success(['deleted'=>true]);}
 JsonResponse::error('Endpoint not found.',404);
}catch(PDOException $e){error_log($e->__toString());if($e->getCode()==='23000')JsonResponse::error('This request conflicts with an existing record.',409);JsonResponse::error('The service is temporarily unavailable.',500);}catch(InvalidArgumentException $e){JsonResponse::error($e->getMessage(),400);}catch(DomainException $e){JsonResponse::error($e->getMessage(),403);}catch(Throwable $e){error_log($e->__toString());JsonResponse::error(Env::get('APP_DEBUG','false')==='true'?$e->getMessage():'An unexpected error occurred.',500);}
