import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // or PrismaService
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessages } from 'src/error/messages';
import { VerifyTokenResponseDto } from './dto/veryfy-token-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserAndGenerateToken(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) throw new BadRequestException(ErrorMessages.INVALID_CREDENTIALS);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new BadRequestException(ErrorMessages.INVALID_CREDENTIALS);

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // return this.jwtService.signAsync(payload, {
    //   secret: process.env.JWT_SECRET,
    //   expiresIn: '1h',
    //   keyid: 'url-shortener-jwt-key',
    // });

    return payload;
  }

  async verifyToken(token: string): Promise<VerifyTokenResponseDto> {
    const payload = await this.jwtService.verifyAsync<{
      id: string;
      email: string;
      name: string;
    }>(token, {
      secret: process.env.JWT_SECRET,
    });

    return new VerifyTokenResponseDto({ id: payload.id, email: payload.email });
  }
}
