<?php
declare(strict_types=1);
namespace App\Services;

use App\Repositories\AuthRepository;

final class AuthService {
 public function __construct(private readonly AuthRepository $repo,private readonly int $maxUsers=50){}
 public function login(string $email,string $password,string $ipHash):array{$user=$this->repo->findByEmail(mb_strtolower(trim($email)));$valid=$user&&$user['password_hash']&&password_verify($password,$user['password_hash']);if(!$valid||!(bool)($user['is_active']??false)){$this->repo->event($user?(int)$user['id']:null,'login_failed',$ipHash);password_verify($password,'$2y$10$zP0wkmyI8D8KXlgYjSZ3cuueUPv7JzN6FZxehKNq3IP4HYWfQOepG');throw new \DomainException('Invalid email or password.');}session_regenerate_id(true);$_SESSION['user_id']=(int)$user['id'];unset($_SESSION['csrf']);$this->repo->touchLogin((int)$user['id']);$this->repo->event((int)$user['id'],'login_success',$ipHash);return$this->publicUser($user);}
 public function logout(?int $userId,string $ipHash):void{if($userId)$this->repo->event($userId,'logout',$ipHash);$_SESSION=[];if(ini_get('session.use_cookies')){$p=session_get_cookie_params();setcookie(session_name(),'',time()-42000,$p['path'],$p['domain'],$p['secure'],$p['httponly']);}session_destroy();}
 public function current():?array{$id=(int)($_SESSION['user_id']??0);if(!$id)return null;$user=$this->repo->findActive($id);if(!$user){unset($_SESSION['user_id']);return null;}return$this->publicUser($user);}
 public function requireUser():array{return$this->current()??throw new \DomainException('Authentication required.');}
 public function requireAdmin():array{$u=$this->requireUser();if($u['role']!=='admin')throw new \DomainException('Administrator access required.');return$u;}
 public function invite(array $data,int $adminId):array{if($this->repo->countUsers() >= $this->maxUsers)throw new \DomainException('The 50-user account limit has been reached.');if($this->repo->findByEmail($data['email']))throw new \InvalidArgumentException('An account already exists for this email.');$token=bin2hex(random_bytes(32));$expires=(new \DateTimeImmutable('+48 hours'))->format('Y-m-d H:i:s');$this->repo->createInvitation($data['name'],$data['email'],hash('sha256',$token),$adminId,$expires);return['token'=>$token,'expiresAt'=>$expires];}
 public function invitation(string $token):array{$i=$this->repo->invitation(hash('sha256',$token))??throw new \DomainException('This invitation is invalid or has expired.');return['name'=>$i['name'],'email'=>$i['email'],'expiresAt'=>$i['expires_at']];}
 public function accept(string $token,string $password,string $ipHash):array{$invite=$this->repo->invitation(hash('sha256',$token))??throw new \DomainException('This invitation is invalid or has expired.');if(!$invite['existing_user_id']&&$this->repo->countUsers()>=$this->maxUsers)throw new \DomainException('The 50-user account limit has been reached.');$id=$this->repo->acceptInvitation($invite,password_hash($password,PASSWORD_DEFAULT));session_regenerate_id(true);$_SESSION['user_id']=$id;unset($_SESSION['csrf']);$this->repo->event($id,'invitation_accepted',$ipHash);return$this->current()??throw new \RuntimeException('Account activation failed.');}
 private function publicUser(array $u):array{return['id'=>(int)$u['id'],'name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role'],'isAdmin'=>$u['role']==='admin'];}
}
