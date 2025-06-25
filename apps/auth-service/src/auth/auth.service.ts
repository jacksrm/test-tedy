import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // or PrismaService
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessages } from 'src/error/messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserAndGenerateToken(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.findByEmail(loginDto.email);

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

    return this.jwtService.signAsync(payload);
  }
}
