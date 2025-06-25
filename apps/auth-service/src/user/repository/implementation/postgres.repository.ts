import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListUsersOptionsDto } from 'src/user/dto/list-users-options.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostgresRepository implements UserRepository {
  constructor(private client: PrismaService) {}

  async list(options: ListUsersOptionsDto): Promise<User[]> {
    const { limit = 20, page = 1 } = options;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    return this.client.user.findMany({
      take: limit,
      skip: startIndex,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: User): Promise<User> {
    return this.client.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    if (!user) return null;

    return user;
  }

  async delete(user: User): Promise<User> {
    return this.client.user.update({
      where: { id: user.id },
      data: {
        deletedAt: user.deletedAt,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.client.user.findUnique({ where: { email } });
  }
  update(data: User): Promise<User> {
    return this.client.user.update({
      where: { id: data.id },
      data,
    });
  }
}
