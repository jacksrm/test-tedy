import { Test, TestingModule } from '@nestjs/testing';
import { HashStringService } from './hash-string.service';

describe('HashStringService', () => {
  let service: HashStringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashStringService],
    }).compile();

    service = module.get<HashStringService>(HashStringService);
  });

  describe('hash', () => {
    it('shoud hash a string', async () => {
      const str = 'test';
      const result = await service.hash(str);
      expect(result).not.toBe(str);
      expect(result.length).toBeGreaterThan(10);
    });
  });
});
