<?php
declare(strict_types=1);
namespace Tests;
use App\Validation\AuthValidator;use PHPUnit\Framework\TestCase;
final class AuthValidatorTest extends TestCase {
 public function testNormalizesLoginEmail():void{[$data,$errors]=AuthValidator::login(['email'=>' Adam@Example.COM ','password'=>'secret']);$this->assertSame([],$errors);$this->assertSame('adam@example.com',$data['email']);}
 public function testStrongInvitationPassword():void{[$data,$errors]=AuthValidator::password(['password'=>'LongEnoughPass9']);$this->assertSame([],$errors);$this->assertSame('LongEnoughPass9',$data['password']);}
 public function testRejectsWeakPasswordAndMassAssignment():void{[, $weak]=AuthValidator::password(['password'=>'short']);$this->assertArrayHasKey('password',$weak);[, $extra]=AuthValidator::invite(['name'=>'A','email'=>'a@example.com','role'=>'admin']);$this->assertArrayHasKey('form',$extra);}
}
