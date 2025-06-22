import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { MemoryRepository } from './repositories/mock/memory.repository';
import { UrlRepository } from './repositories/url.repository';
import { Url } from './url.model';
import { ErrorMessages } from './error/messages';

describe('UrlService', () => {
  let service: UrlService;
  let repository: MemoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: UrlRepository, useClass: MemoryRepository },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<MemoryRepository>(UrlRepository);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-21T20:00:00.000Z'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('generateShortCode', () => {
    it('should generate a random string of length 6', () => {
      const result = service.generateShortCode();
      expect(result.length).toBe(6);
    });
  });

  describe('shortenUrl', () => {
    it('should shorten a URL and return the url with the generated short code', async () => {
      const result = await service.shorten({ originalUrl: 'www.example.com' });

      expect(result.shortCode.length).toBe(6);
    });

    it('should check if the code is unique', async () => {
      service.generateShortCode.bind(service);
      repository.getByShortCode.bind(repository);

      const generateShortCode = jest
        .spyOn(service, 'generateShortCode')
        .mockReturnValueOnce('zJzI04');
      jest.spyOn(repository, 'getByShortCode').mockResolvedValueOnce(
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
        }),
      );

      const result = await service.shorten({ originalUrl: 'www.example.com' });

      expect(result.shortCode.length).toBe(6);
      expect(generateShortCode).toHaveBeenCalledTimes(2);
      expect(result.shortCode).not.toBe('zJzI04');
    });

    it('should check if the short code is unique only ten times', async () => {
      repository.getByShortCode.bind(repository);
      const generateShortCode = jest.spyOn(service, 'generateShortCode');
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async () => {
          console.log('called');
          return new Url({
            shortCode: 'zJzI04',
            originalUrl: 'www.example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            id: '1',
            clicks: 1,
          });
        });

      await expect(
        service.shorten({ originalUrl: 'www.example.com' }),
      ).rejects.toThrow(new Error(ErrorMessages.INTERNAL_ERROR_2));
      // check if the generateShortCode function was called ten times (or more, but we don't know how many times it will be called
      expect(getByShortCode).toHaveBeenCalledTimes(12);
      expect(generateShortCode).toHaveBeenCalledTimes(11);
    });

    it('should throw an error if the database is down', async () => {
      jest.spyOn(repository, 'getByShortCode').mockImplementation(async () => {
        throw new Error('Database is down');
      });

      await expect(
        service.shorten({ originalUrl: 'www.example.com' }),
      ).rejects.toThrow(ErrorMessages.INTERNAL_ERROR_1);
    });

    it('should save the url in the database', async () => {
      const save = jest.spyOn(repository, 'save');
      service.generateShortCode = jest.fn().mockReturnValue('abcde');

      await service.shorten({ originalUrl: 'www.example.com' });
      expect(save).toHaveBeenCalledTimes(1);
      expect(repository.urls[0]).toHaveProperty<Url>('id');
    });

    it('should save the url in the database with the owner id if provided', async () => {
      const save = jest.spyOn(repository, 'save');
      service.generateShortCode = jest.fn().mockReturnValue('abcde');

      const data = {
        originalUrl: 'www.example.com',
        userId: '1',
      };

      await service.shorten(data);
      expect(save).toHaveBeenCalledTimes(1);
      expect(repository.urls[0]).toHaveProperty<Url>('id');
      expect(repository.urls[0].userId).toEqual('1');
    });
  });

  describe('getUrlByShortCode', () => {
    it('should return the url with the given short code if exists', async () => {
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(
          async () =>
            new Url({
              shortCode: 'zJzI04',
              originalUrl: 'www.example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
              id: '1',
              clicks: 1,
            }),
        );

      const result = await service.getUrlByShortCode('abcde');
      expect(getByShortCode).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Url);
    });

    it('should ignore deleted urls', async () => {
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(
          async () =>
            new Url({
              shortCode: 'zJzI04',
              originalUrl: 'www.example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
              id: '1',
              clicks: 1,
              deletedAt: new Date(),
            }),
        );

      const result = await service.getUrlByShortCode('abcde');
      expect(getByShortCode).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw an error if the database is down', async () => {
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async () => {
          throw new Error('Database is down');
        });

      await expect(service.getUrlByShortCode('zJzI04')).rejects.toThrow(
        new Error(ErrorMessages.INTERNAL_ERROR_1),
      );
      expect(getByShortCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('listUrls', () => {
    it('should return a list of urls for the given user', async () => {
      const list = jest
        .spyOn(repository, 'list')
        .mockImplementation(async () => [
          new Url({
            shortCode: 'zJzI04',
            originalUrl: 'www.example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            id: '1',
            clicks: 1,
            userId: '1',
          }),
          new Url({
            shortCode: 'zJzI05',
            originalUrl: 'www.example2.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            id: '2',
            clicks: 3,
            userId: '1',
          }),
        ]);

      const result = await service.list({ userId: '1' });

      expect(result).toHaveLength(2);
      expect(list).toHaveBeenCalledTimes(1);
      expect(list).toHaveBeenCalledWith({ userId: '1' });
    });
  });

  describe('update', () => {
    it('should update the short code when provided', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
        }),
      ];
      const save = jest
        .spyOn(repository, 'save')
        .mockImplementation(async (url: Url) => url);
      const getById = jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async (shortCode: string) =>
          urls.find((url) => url.shortCode === shortCode),
        );

      const result = await service.update({
        userId: '1',
        shortCode: 'newcod',
        id: '1',
      });

      expect(result.shortCode).toBe('newcod');
      expect(getByShortCode).toHaveBeenCalled();
      expect(getByShortCode).toHaveBeenCalledWith('newcod');
      expect(save).toHaveBeenCalled();
      expect(getById).toHaveBeenCalled();
    });
    it('should update the original url when provided', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
        }),
      ];
      const save = jest
        .spyOn(repository, 'save')
        .mockImplementation(async (url: Url) => url);
      const getById = jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );
      const getByShortCode = jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async (shortCode: string) =>
          urls.find((url) => url.shortCode === shortCode),
        );

      const result = await service.update({
        userId: '1',
        originalUrl: 'www.newexample.com',
        id: '1',
      });

      expect(result.originalUrl).toBe('www.newexample.com');
      expect(getByShortCode).not.toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(getById).toHaveBeenCalled();
    });

    it('should not update if the userId does not match', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
        }),
      ];
      jest
        .spyOn(repository, 'save')
        .mockImplementation(async (url: Url) => url);
      jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );
      jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async (shortCode: string) =>
          urls.find((url) => url.shortCode === shortCode),
        );

      await expect(
        service.update({
          userId: '2',
          originalUrl: 'www.newexample.com',
          id: '1',
        }),
      ).rejects.toThrow(new Error(ErrorMessages.UNAUTHORIZED_USER));
    });

    it('should not update if the url is deleted', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
          deletedAt: new Date(),
        }),
      ];
      jest
        .spyOn(repository, 'save')
        .mockImplementation(async (url: Url) => url);
      jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );
      jest
        .spyOn(repository, 'getByShortCode')
        .mockImplementation(async (shortCode: string) =>
          urls.find((url) => url.shortCode === shortCode),
        );

      await expect(
        service.update({
          userId: '1',
          originalUrl: 'www.example.com',
          id: '1',
        }),
      ).rejects.toThrow(ErrorMessages.BAD_REQUEST_1);
    });
  });

  describe('delete', () => {
    it('should delete the url when data is provided', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
        }),
      ];
      jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );
      const deleteMethod = jest
        .spyOn(repository, 'delete')
        .mockImplementation(async () => {
          urls[0] = new Url({
            ...urls[0],
            deletedAt: new Date(),
          });
        });

      await service.delete({
        id: '1',
        userId: '1',
      });

      expect(deleteMethod).toHaveBeenCalledWith('1');
      expect(urls[0].deletedAt).toBeDefined();
    });

    it('should throw an error when the url is not found', async () => {
      jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) => undefined);

      await expect(
        service.delete({
          id: '1',
          userId: '1',
        }),
      ).rejects.toThrow(ErrorMessages.BAD_REQUEST_1);
    });

    it('should throw an error when the userId does not match', async () => {
      const urls = [
        new Url({
          shortCode: 'zJzI04',
          originalUrl: 'www.example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
          clicks: 1,
          userId: '1',
        }),
      ];
      jest
        .spyOn(repository, 'getById')
        .mockImplementation(async (id: string) =>
          urls.find((url) => url.id === id),
        );

      await expect(
        service.delete({
          id: '1',
          userId: '2',
        }),
      ).rejects.toThrow(ErrorMessages.UNAUTHORIZED_USER);
    });
  });
});
