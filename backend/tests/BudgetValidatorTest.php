<?php
declare(strict_types=1);
namespace Tests;
use App\Validation\BudgetValidator;use PHPUnit\Framework\TestCase;
final class BudgetValidatorTest extends TestCase {
 public function testConvertsTargetsAndBuildsCycleEndDate():void{[$data,$errors]=BudgetValidator::validate(['dailyBudget'=>'40','monthlyBudget'=>'1200.50','effectiveFrom'=>'2026-08-04','periodDays'=>31]);$this->assertSame([],$errors);$this->assertSame(4000,$data['dailyBudgetCentimes']);$this->assertSame(120050,$data['monthlyBudgetCentimes']);$this->assertSame(31,$data['periodDays']);$this->assertSame('2026-09-03',$data['effectiveTo']);}
 public function testRejectsDailyTargetThatWouldExceedPeriodBudget():void{[, $errors]=BudgetValidator::validate(['dailyBudget'=>'120','monthlyBudget'=>'3000','effectiveFrom'=>'2026-09-03','periodDays'=>30]);$this->assertArrayHasKey('dailyBudget',$errors);$this->assertStringContainsString('3600.00 DH',$errors['dailyBudget']);$this->assertStringContainsString('100.00 DH or less',$errors['dailyBudget']);}
 public function testAllowsUserToChooseLowerDailyTarget():void{[$data,$errors]=BudgetValidator::validate(['dailyBudget'=>'90','monthlyBudget'=>'3000','effectiveFrom'=>'2026-09-03','periodDays'=>30]);$this->assertSame([],$errors);$this->assertSame(9000,$data['dailyBudgetCentimes']);}
 public function testRejectsUnexpectedFields():void{[, $errors]=BudgetValidator::validate(['dailyBudget'=>'-1','monthlyBudget'=>'0','effectiveFrom'=>'bad','userId'=>2]);$this->assertArrayHasKey('form',$errors);}
}
