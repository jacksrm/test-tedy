import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    const { createdAt, updatedAt, email, id, name } = data;
    Object.assign(this, { createdAt, updatedAt, email, id, name });
  }
}
