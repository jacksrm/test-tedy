import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and be at least 8 characters long',
  })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}
