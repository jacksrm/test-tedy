import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { HashStringModule } from './hash-string/hash-string.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, HashStringModule, AuthModule],
})
export class AppModule {}
