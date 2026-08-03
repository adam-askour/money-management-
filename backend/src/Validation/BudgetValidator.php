<?php
declare(strict_types=1);
namespace App\Validation;

final class BudgetValidator {
 public static function validate(array $in):array{if(array_diff(array_keys($in),['dailyBudget','monthlyBudget','effectiveFrom']))return[null,['form'=>'Unexpected fields were provided.']];$e=[];$daily=self::money((string)($in['dailyBudget']??''),10000000,$e,'dailyBudget');$monthly=self::money((string)($in['monthlyBudget']??''),100000000,$e,'monthlyBudget');$date=(string)($in['effectiveFrom']??'');$d=\DateTimeImmutable::createFromFormat('!Y-m-d',$date);if(!$d||$d->format('Y-m-d')!==$date)$e['effectiveFrom']='Choose a valid effective date.';return$e?[null,$e]:[['dailyBudgetCentimes'=>$daily,'monthlyBudgetCentimes'=>$monthly,'effectiveFrom'=>$date],[]];}
 private static function money(string $v,int $max,array &$e,string $key):?int{if(!preg_match('/^\d+(?:\.\d{1,2})?$/',$v)){$e[$key]='Enter a valid amount with up to 2 decimals.';return null;}[$w,$d]=array_pad(explode('.',$v,2),2,'');$c=(int)$w*100+(int)str_pad($d,2,'0');if($c<1||$c>$max)$e[$key]='Enter an amount within the allowed range.';return$c;}
}
