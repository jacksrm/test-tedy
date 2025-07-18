import { ListUsersOptionsDto } from '../dto/list-users-options.dto';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract update(user: User): Promise<User>;
  abstract delete(user: User): Promise<User>;
  abstract list(options?: ListUsersOptionsDto): Promise<User[]>;
}
