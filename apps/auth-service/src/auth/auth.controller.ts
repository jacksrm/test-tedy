import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyTokenResponseDto } from './dto/veryfy-token-response.dto';
import { ErrorMessages } from '../error/messages';
import { v4 } from 'uuid';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  //   const token = await this.authService.validateUserAndGenerateToken(loginDto);

  //   return new AuthResponseDto(token);
  // }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const data = await this.authService.validateUserAndGenerateToken(loginDto);

    return new AuthResponseDto({
      accessToken: {
        ...data,
        // expires in 1 hour
        exp: Math.floor(Date.now() / 1000) + 3600,
        jti: v4(), // unique identifier for the token
      },
    });
  }

  @Post('verify')
  verify(
    @Headers('authorization') authorization: string,
  ): Promise<VerifyTokenResponseDto> {
    if (!authorization)
      throw new BadRequestException(ErrorMessages.AUTHORIZATION_MISSING);

    const token = authorization.split(' ')[1];
    return this.authService.verifyToken(token);
  }
}
