import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HashStringModule } from '../hash-string/hash-string.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './repository/user.repository';
import { PostgresRepository } from './repository/implementation/postgres.repository';

@Module({
  imports: [HashStringModule, PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: PostgresRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
