import {
  IsString,
  MinLength,
  IsEmail,
  Matches,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import {} from 'class-transformer';
import { UserRole } from '@prisma/client';

export class SignupDto {
  id: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  name: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+\d{1,3}\s?\(\d{1,3}\)\s?\d{1,4}-\d{1,4}$/, {
    message: 'phone number must be in the format +xxx(xxx)xxxx-xxxx',
  })
  phone: string;
  @IsString()
  @IsOptional()
  productKey?: string;
}
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class GenerateProductDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsEnum(UserRole)
  userType: UserRole;
}
