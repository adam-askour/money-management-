<?php
declare(strict_types=1);
namespace App\Services;
use DateTimeImmutable;use DateTimeInterface;use DateTimeZone;
final class DatePolicy {
 public function __construct(private readonly DateTimeZone $timezone,private readonly ?DateTimeImmutable $fixedNow=null,private readonly array $manualEditableDates=[],private readonly ?string $activationDate=null){ }
 public function now():DateTimeImmutable{return $this->fixedNow??new DateTimeImmutable('now',$this->timezone);}
 public function state(string $date):array{$day=DateTimeImmutable::createFromFormat('!Y-m-d',$date,$this->timezone);if(!$day||$day->format('Y-m-d')!==$date)throw new \InvalidArgumentException('Invalid date.');$today=$this->now()->setTime(0,0);if($day>$today)return['editable'=>false,'state'=>'upcoming','label'=>'Upcoming'];if($this->activationDate!==null&&$date<$this->activationDate)return['editable'=>false,'state'=>'before_activation','label'=>'Before account started'];if(in_array($date,$this->manualEditableDates,true))return['editable'=>true,'state'=>'manual','label'=>'Manual edit access'];if($day==$today)return['editable'=>true,'state'=>'today','label'=>'Today'];$yesterday=$today->modify('-1 day');if($day==$yesterday){$cutoff=$today->setTime(9,0);if($this->now()<$cutoff)return['editable'=>true,'state'=>'grace','label'=>'Editable until 9:00 AM'];}return['editable'=>false,'state'=>'locked','label'=>'Locked'];}
 public function assertEditable(string $date):void{if(!$this->state($date)['editable'])throw new \DomainException('This day is locked and cannot be changed.');}
}
