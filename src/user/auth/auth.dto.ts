import {
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import {} from 'class-transformer';

export class SignupDto {
  id: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  name: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
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
}
