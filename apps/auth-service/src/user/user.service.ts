import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { v4 } from 'uuid';
import { ErrorMessages } from '../error/messages';
import { UserResponseDto } from './dto/user-response.dto';
import { ListUsersOptionsDto } from './dto/list-users-options.dto';
import { HashStringService } from '../hash-string/hash-string.service';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private hashService: HashStringService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    let exists: User | null;
    try {
      exists = await this.repository.findByEmail(data.email);
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }
    if (exists)
      throw new BadRequestException(ErrorMessages.USER_ALREADY_EXISTS);

    const user = new User({
      ...data,
      email: data.email.toLowerCase(),
      password: await this.hashService.hash(data.password),
      id: v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const result = await this.repository.create(user);
      return result;
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }
  }

  async findAll(options?: ListUsersOptionsDto) {
    let users: User[];

    try {
      users = await this.repository.list(options);
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }
    const result = users.map((user) => new UserResponseDto(user));
    return result;
  }

  async findOne(id: string): Promise<User> {
    let result: User | null;
    try {
      result = await this.repository.findById(id);
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }

    if (!result || result.deletedAt)
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);

    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      let exists: User | null;
      try {
        exists = await this.repository.findByEmail(
          updateUserDto.email.toLowerCase(),
        );
      } catch {
        throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
      }
      if (exists && exists.id !== id)
        throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }

    let toUpdate: User | null;
    try {
      toUpdate = await this.repository.findById(id);
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }

    if (!toUpdate) throw new BadRequestException(ErrorMessages.BAD_REQUEST_1);

    if (toUpdate.deletedAt)
      throw new BadRequestException(ErrorMessages.BAD_REQUEST_1);

    const updatedUser = new User({
      ...toUpdate,
      email: (updateUserDto.email ?? toUpdate.email).toLowerCase(),
      password: updateUserDto.password ?? toUpdate.password,
      name: updateUserDto.name ?? toUpdate.name,
      updatedAt: new Date(),
    });

    try {
      const result = await this.repository.update(updatedUser);
      return result;
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }
  }

  async remove(id: string): Promise<User> {
    const toDelete: User | null = await this.repository.findById(id);

    if (!toDelete) throw new BadRequestException(ErrorMessages.BAD_REQUEST_1);

    if (toDelete.deletedAt)
      throw new BadRequestException(ErrorMessages.BAD_REQUEST_1);

    const deleted = new User({
      ...toDelete,
      deletedAt: new Date(),
    });
    return this.repository.delete(deleted);
  }

  async findByEmail(email: string): Promise<User> {
    let result: User | null;
    try {
      result = await this.repository.findByEmail(email);
    } catch {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1);
    }

    if (!result || result.deletedAt)
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND_2);

    return result;
  }
}
