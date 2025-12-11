// src/users/dto/create-user.dto
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8) // match login & security policy
  password!: string;
  displayName?: string;  // เพิ่ม displayName ให้กับ DTO เพื่อให้สามารถใช้ในฟังก์ชัน create

}
