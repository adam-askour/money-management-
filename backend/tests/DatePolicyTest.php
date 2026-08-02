<?php
declare(strict_types=1);
namespace Tests;
use App\Services\DatePolicy;use DateTimeImmutable;use DateTimeZone;use PHPUnit\Framework\TestCase;
final class DatePolicyTest extends TestCase {
 private function policy(string $now):DatePolicy{$tz=new DateTimeZone('Europe/Amsterdam');return new DatePolicy($tz,new DateTimeImmutable($now,$tz));}
 public function testYesterdayEditableBeforeNine():void{$this->assertTrue($this->policy('2026-08-02 08:59:59')->state('2026-08-01')['editable']);}
 public function testYesterdayLockedAtNine():void{$this->assertFalse($this->policy('2026-08-02 09:00:00')->state('2026-08-01')['editable']);}
 public function testOlderDayLocked():void{$this->assertFalse($this->policy('2026-08-03 08:00')->state('2026-08-01')['editable']);}
 public function testFutureDayLocked():void{$this->assertSame('upcoming',$this->policy('2026-08-02 12:00')->state('2026-08-03')['state']);}
 public function testTodayEditable():void{$this->assertTrue($this->policy('2026-08-02 23:59')->state('2026-08-02')['editable']);}
}
