import { User } from 'src/user/entities/user.entity';
import { UserRepository } from '../user.repository';
import { Injectable } from '@nestjs/common';
import { ListUsersOptionsDto } from 'src/user/dto/list-users-options.dto';

@Injectable()
export class MockUserRepository extends UserRepository {
  create(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  update(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  delete(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  list(options?: ListUsersOptionsDto): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
}
