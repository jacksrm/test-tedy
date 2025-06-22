import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UrlRepository } from './repositories/url.repository';
import { PostgresRepository } from './repositories/implementation/postgres.repository';

@Module({
  providers: [
    UrlService,
    PrismaService,
    { provide: UrlRepository, useClass: PostgresRepository },
  ],
  controllers: [UrlController],
})
export class UrlModule {}
