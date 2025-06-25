import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ErrorMessages } from '../error/messages';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const result = await this.userService.create(createUserDto);

    return new UserResponseDto(result);
  }

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<UserResponseDto[]> {
    return this.userService.findAll({ page: +page, limit: +limit });
  }

  @Get('me')
  async findOne(@Headers('x-id') id: string): Promise<UserResponseDto> {
    if (!id) throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_USER);

    const result = await this.userService.findOne(id);
    return new UserResponseDto(result);
  }

  @Patch('me')
  async update(
    @Headers('x-id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!id) throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_USER);

    const result = await this.userService.update(id, updateUserDto);

    return new UserResponseDto(result);
  }

  @Delete('me')
  async remove(@Headers('x-id') id: string): Promise<UserResponseDto> {
    if (!id) throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_USER);

    const result = await this.userService.remove(id);
    return new UserResponseDto(result);
  }
}
