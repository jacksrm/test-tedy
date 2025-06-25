import { Module } from '@nestjs/common';
import { HashStringService } from './hash-string.service';

@Module({
  providers: [HashStringService],
  exports: [HashStringService],
})
export class HashStringModule {}
