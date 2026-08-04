<?php
declare(strict_types=1);
namespace App\Services;

use App\Repositories\MoneyRepository;
use DateInterval;
use DatePeriod;
use DateTimeImmutable;

final class MoneyService {
 public function __construct(private readonly MoneyRepository $repo,private readonly DatePolicy $dates,private readonly int $userId,private readonly string $activationDate){}

 public function month(string $month):array {
  if(!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/',$month))throw new \InvalidArgumentException('Invalid month.');
  $start=new DateTimeImmutable("$month-01");$end=$start->modify('last day of this month');
  $raw=$this->repo->monthExpenses($this->userId,$start->format('Y-m-d'),$end->format('Y-m-d'));
  $grouped=[];foreach($raw as $e)$grouped[$e['expense_date']][]=$e;
  $days=[];$totalSpent=$saved=$over=$underCount=$onCount=$overCount=$emptyCount=$recordedCount=0;
  $today=$this->dates->now()->format('Y-m-d');$todayInfo=null;
  foreach(new DatePeriod($start,new DateInterval('P1D'),$end->modify('+1 day')) as $date){
   $key=$date->format('Y-m-d');$expenses=$grouped[$key]??[];$recorded=count($expenses)>0;
   $budget=$this->repo->budget($this->userId,$key)['daily'];$total=array_sum(array_map(fn($e)=>(int)$e['amount_centimes'],$expenses));
   $difference=$budget===null?null:$budget-$total;$state=$this->budgetState($recorded,$difference);$edit=$this->dates->state($key);
   if(!$recorded){if($edit['state']!=='before_activation')$emptyCount++;}else{$recordedCount++;$totalSpent+=$total;if($difference!==null){if($difference>0){$saved+=$difference;$underCount++;}elseif($difference<0){$over+=abs($difference);$overCount++;}else$onCount++;}}
   $day=['date'=>$key,'fullDate'=>$date->format('l, j F Y'),'weekday'=>$date->format('l'),'displayDate'=>$date->format('j F Y'),'recorded'=>$recorded,'expenseCount'=>count($expenses),'preview'=>array_slice(array_column($expenses,'description'),0,2),'totalCentimes'=>$total,'dailyBudgetCentimes'=>$budget,'differenceCentimes'=>$recorded?$difference:null,'budgetState'=>$state['key'],'budgetMessage'=>$state['label'],'editable'=>$edit['editable'],'editState'=>$edit['state'],'editLabel'=>$edit['label']];
   $days[]=$day;if($key===$today)$todayInfo=$day;
  }
  $activation=new DateTimeImmutable($this->activationDate);$beforeActivation=$end<$activation;$anchor=$activation>$start?$activation:$start;
  $monthBudget=$beforeActivation?['daily'=>null,'monthly'=>null,'effectiveFrom'=>null]:$this->repo->budget($this->userId,$anchor->format('Y-m-d'));
  $firstSetup=!$this->repo->hasBudget($this->userId);$currentMonth=$this->dates->now()->format('Y-m');
  $needsMonthlyGoal=$month===$currentMonth&&($monthBudget['effectiveFrom']===null||$monthBudget['effectiveFrom']<$start->format('Y-m-d'));
  $goalEffectiveFrom=$firstSetup&&$activation>$start?$activation->format('Y-m-d'):$start->format('Y-m-d');
  $prorated=$firstSetup&&$goalEffectiveFrom>$start->format('Y-m-d');$daysInMonth=(int)$end->format('j');
  $remainingDays=$prorated?$daysInMonth-(int)substr($goalEffectiveFrom,8,2)+1:$daysInMonth;
  $target=$monthBudget['monthly']??($monthBudget['daily']===null?null:$monthBudget['daily']*$daysInMonth);
  $todayInfo??=['recorded'=>false,'totalCentimes'=>0,'differenceCentimes'=>null,'budgetState'=>'empty'];
  return['serverToday'=>$today,'serverTodayLabel'=>$this->dates->now()->format('l, j F Y'),'month'=>$month,'days'=>$days,
   'budget'=>['dailyBudgetCentimes'=>$monthBudget['daily'],'monthlyBudgetCentimes'=>$target,'effectiveFrom'=>$monthBudget['effectiveFrom'],'needsMonthlyGoal'=>$needsMonthlyGoal,'firstSetup'=>$firstSetup,'goalEffectiveFrom'=>$goalEffectiveFrom,'proratedFirstMonth'=>$prorated,'remainingDays'=>$remainingDays,'daysInMonth'=>$daysInMonth],
   'summary'=>['dailyBudgetCentimes'=>$monthBudget['daily'],'today'=>['recorded'=>$todayInfo['recorded'],'totalCentimes'=>$todayInfo['totalCentimes'],'differenceCentimes'=>$todayInfo['differenceCentimes'],'state'=>$todayInfo['budgetState']],'totalSpentCentimes'=>$totalSpent,'monthlyTargetCentimes'=>$target,'totalSavedCentimes'=>$saved,'totalOverCentimes'=>$over,'remainingCentimes'=>$target===null?null:$target-$totalSpent,'averageRecordedCentimes'=>$recordedCount?(int)round($totalSpent/$recordedCount):0,'daysUnder'=>$underCount,'daysOn'=>$onCount,'daysOver'=>$overCount,'daysEmpty'=>$emptyCount]];
 }

 public function day(string $date):array{$edit=$this->dates->state($date);$expenses=array_map(fn($e)=>['id'=>(int)$e['id'],'description'=>$e['description'],'amountCentimes'=>(int)$e['amount_centimes']],$this->repo->dayExpenses($this->userId,$date));$recorded=(bool)$expenses;$total=array_sum(array_column($expenses,'amountCentimes'));$budget=$this->repo->budget($this->userId,$date)['daily'];$difference=$budget===null?null:$budget-$total;$state=$this->budgetState($recorded,$difference);return['date'=>$date,'expenses'=>$expenses,'recorded'=>$recorded,'totalCentimes'=>$total,'dailyBudgetCentimes'=>$budget,'differenceCentimes'=>$recorded?$difference:null,'budgetState'=>$state['key'],'budgetMessage'=>$state['label'],'editable'=>$edit['editable'],'editState'=>$edit['state'],'editLabel'=>$edit['label']];}
 public function setBudget(array $data):void{$firstSetup=!$this->repo->hasBudget($this->userId);if($firstSetup){$activation=new DateTimeImmutable($this->activationDate);$currentStart=$this->dates->now()->modify('first day of this month')->setTime(0,0);$effective=$activation>$currentStart?$activation:$currentStart;$data['effectiveFrom']=$effective->format('Y-m-d');if((int)$effective->format('j')>1){$days=(int)$effective->format('t');$remaining=$days-(int)$effective->format('j')+1;$data['monthlyBudgetCentimes']=(int)round($data['monthlyBudgetCentimes']*$remaining/$days);}}$this->repo->setBudget($this->userId,$data['dailyBudgetCentimes'],$data['monthlyBudgetCentimes'],$data['effectiveFrom']);}
 public function add(string $date,array $data,string $key):array{$this->dates->assertEditable($date);$id=$this->repo->create($this->userId,$date,$data['description'],$data['amountCentimes'],$key);return['id'=>$id];}
 public function update(int $id,array $data):void{$expense=$this->repo->findOwned($id,$this->userId)??throw new \DomainException('Expense not found.');$this->dates->assertEditable($expense['expense_date']);$this->repo->update($id,$this->userId,$data['description'],$data['amountCentimes']);}
 public function delete(int $id):void{$expense=$this->repo->findOwned($id,$this->userId)??throw new \DomainException('Expense not found.');$this->dates->assertEditable($expense['expense_date']);$this->repo->delete($id,$this->userId);}
 private function budgetState(bool $recorded,?int $difference):array{if($difference===null)return['key'=>'empty','label'=>'Set your budget'];if(!$recorded)return['key'=>'empty','label'=>'No expenses recorded'];if($difference>0)return['key'=>'under','label'=>'Saved '.$this->dh($difference)];if($difference<0)return['key'=>'over','label'=>'Over budget by '.$this->dh(abs($difference))];return['key'=>'on','label'=>'On budget'];}
 private function dh(int $c):string{return number_format($c/100,2,'.','').' DH';}
}
