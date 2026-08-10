<?php
declare(strict_types=1);
namespace Tests;
use App\Validation\ExpenseValidator;use PHPUnit\Framework\TestCase;
final class ExpenseValidatorTest extends TestCase {
 public function testConvertsMoneyToIntegerCentimes():void{[$data,$errors]=ExpenseValidator::validate(['description'=>'Coffee','amount'=>'12.50']);$this->assertSame([], $errors);$this->assertSame(1250,$data['amountCentimes']);}
 public function testAcceptsOneOrTwoDecimalPlaces():void{foreach(['3.1'=>310,'4.50'=>450,'0.01'=>1] as $amount=>$centimes){[$data,$errors]=ExpenseValidator::validate(['description'=>'Taxi','amount'=>$amount]);$this->assertSame([],$errors);$this->assertSame($centimes,$data['amountCentimes']);}}
 public function testRejectsInvalidAmounts():void{foreach(['-1','0','1.234','NaN','100000.01'] as $amount){[, $errors]=ExpenseValidator::validate(['description'=>'Taxi','amount'=>$amount]);$this->assertArrayHasKey('amount',$errors);}}
 public function testMarkupRemainsPlainData():void{[$data,$errors]=ExpenseValidator::validate(['description'=>'<script>alert(1)</script>','amount'=>'1']);$this->assertSame([], $errors);$this->assertSame('<script>alert(1)</script>',$data['description']);}
 public function testRejectsMassAssignment():void{[, $errors]=ExpenseValidator::validate(['description'=>'Taxi','amount'=>'1','user_id'=>9]);$this->assertArrayHasKey('form',$errors);}
}
