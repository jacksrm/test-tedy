import { Injectable } from '@nestjs/common';
import { Url } from 'src/url/url.model';
import { UrlRepository } from '../url.repository';
import { ListUrlOptions } from 'src/url/dto/list-url-options.dto';

@Injectable()
export class MemoryRepository implements UrlRepository {
  urls: Url[] = [];

  async list(options: ListUrlOptions): Promise<Url[]> {
    const { page = 1, limit = 20, userId } = options ?? {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (userId) {
      const userUrls = this.urls.filter((url) => url.userId === userId);

      return userUrls.slice(startIndex, endIndex);
    }
    return this.urls.slice(startIndex, endIndex);
  }

  async save(data: Url): Promise<Url> {
    this.urls.push(data);
    return data;
  }

  getById(id: string): Promise<Url | undefined> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getByShortCode(shortCode: string): Promise<Url | undefined> {
    return Promise.resolve(
      this.urls.find((url) => url.shortCode === shortCode),
    );
  }
  getByUserId(userId: string): Promise<Url[]> {
    throw new Error('Method not implemented.');
  }
}
