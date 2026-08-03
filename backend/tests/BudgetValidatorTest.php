<?php
declare(strict_types=1);
namespace Tests;
use App\Validation\BudgetValidator;use PHPUnit\Framework\TestCase;
final class BudgetValidatorTest extends TestCase {
 public function testConvertsTargetsToCentimes():void{[$data,$errors]=BudgetValidator::validate(['dailyBudget'=>'40','monthlyBudget'=>'1200.50','effectiveFrom'=>'2026-08-01']);$this->assertSame([],$errors);$this->assertSame(4000,$data['dailyBudgetCentimes']);$this->assertSame(120050,$data['monthlyBudgetCentimes']);}
 public function testRejectsUnexpectedFields():void{[, $errors]=BudgetValidator::validate(['dailyBudget'=>'-1','monthlyBudget'=>'0','effectiveFrom'=>'bad','userId'=>2]);$this->assertArrayHasKey('form',$errors);}
}
