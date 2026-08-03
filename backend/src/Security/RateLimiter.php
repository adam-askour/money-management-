<?php
declare(strict_types=1);
namespace App\Security;

use PDO;

final class RateLimiter {
 public function __construct(private readonly PDO $db,private readonly string $secret){}
 public function hit(string $scope,string $identity,int $limit,int $windowSeconds,int $blockSeconds=0):array{$now=time();$key=hash_hmac('sha256',$scope.'|'.$identity,$this->secret);$this->db->beginTransaction();try{$s=$this->db->prepare('SELECT window_started_at,request_count,blocked_until FROM rate_limits WHERE bucket_key=:key FOR UPDATE');$s->execute(['key'=>$key]);$row=$s->fetch();if(!$row){$i=$this->db->prepare('INSERT INTO rate_limits(bucket_key,window_started_at,request_count,blocked_until) VALUES(:key,:now,1,0)');$i->execute(['key'=>$key,'now'=>$now]);$this->db->commit();return['allowed'=>true,'retryAfter'=>0];}if((int)$row['blocked_until']>$now){$this->db->commit();return['allowed'=>false,'retryAfter'=>(int)$row['blocked_until']-$now];}$start=(int)$row['window_started_at'];$count=(int)$row['request_count'];if($now-$start>=$windowSeconds){$start=$now;$count=1;}else{$count++;}$blocked=$count>$limit&&$blockSeconds>0?$now+$blockSeconds:0;$u=$this->db->prepare('UPDATE rate_limits SET window_started_at=:start,request_count=:count,blocked_until=:blocked WHERE bucket_key=:key');$u->execute(['start'=>$start,'count'=>$count,'blocked'=>$blocked,'key'=>$key]);$this->db->commit();return['allowed'=>$count<=$limit,'retryAfter'=>$count>$limit?max(1,$blocked?:$windowSeconds-($now-$start)):0];}catch(\Throwable $e){if($this->db->inTransaction())$this->db->rollBack();throw$e;}}
}
