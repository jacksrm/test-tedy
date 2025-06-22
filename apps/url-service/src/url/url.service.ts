import { Injectable } from '@nestjs/common';
import { UrlRepository } from './repositories/url.repository';
import { Url } from './url.model';
import { v4 } from 'uuid';
import { CreateUrlServiceDTO } from './dto/create-url-service.dto';
import { ErrorMessages } from './error/messages';
import { ListUrlOptions } from './dto/list-url-options.dto';
import { UpdateUrlServiceDto } from './dto/update-url-service.dto';
import { DeleteUrlServiceDto } from './dto/delete-url-service.dto';

@Injectable()
export class UrlService {
  constructor(private repository: UrlRepository) {}

  async shorten(data: CreateUrlServiceDTO): Promise<Url> {
    let shortCode = this.generateShortCode();
    const attempts = 10;
    let count = 1;

    while (!(await this.isShortCodeUnique(shortCode)) && count <= attempts) {
      shortCode = this.generateShortCode();
      count += 1;
      console.log('shortCode', shortCode);
    }

    if (!(await this.isShortCodeUnique(shortCode))) {
      throw new Error(ErrorMessages.INTERNAL_ERROR_2);
    }

    const urlToSave = new Url({
      clicks: 0,
      originalUrl: data.originalUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      shortCode,
      id: v4(),
      userId: data.userId,
    });

    return this.repository.save(urlToSave);
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    try {
      const result = await this.repository.getByShortCode(shortCode);
      if (result?.deletedAt) return;
      return result;
    } catch {
      throw new Error(ErrorMessages.INTERNAL_ERROR_1);
    }
  }

  async list(options: ListUrlOptions): Promise<Url[]> {
    return await this.repository.list(options);
  }

  async update(data: UpdateUrlServiceDto): Promise<Url> {
    const { shortCode, originalUrl, userId, id } = data;
    const urlToUpdate = await this.repository.getById(id);

    if (urlToUpdate?.deletedAt) throw new Error(ErrorMessages.BAD_REQUEST_1);

    if (urlToUpdate?.userId !== userId)
      throw new Error(ErrorMessages.UNAUTHORIZED_USER);

    if (!urlToUpdate) throw new Error(ErrorMessages.BAD_REQUEST_1);

    if (shortCode) {
      const exists = await this.getUrlByShortCode(shortCode);
      if (exists) {
        throw new Error(ErrorMessages.SHORT_CODE_ALREADY_EXISTS);
      }
    }

    const updatedUrl = new Url({
      ...urlToUpdate,
      updatedAt: new Date(),
      shortCode: shortCode ?? urlToUpdate.shortCode,
      originalUrl: originalUrl ?? urlToUpdate.originalUrl,
    });

    return this.repository.save(updatedUrl);
  }

  async delete(data: DeleteUrlServiceDto): Promise<Url> {
    const { id, userId } = data;
    const urlToDelete = await this.repository.getById(id);
    if (!urlToDelete) throw new Error(ErrorMessages.BAD_REQUEST_1);
    if (userId !== urlToDelete.userId)
      throw new Error(ErrorMessages.UNAUTHORIZED_USER);
    await this.repository.delete(id);
    return urlToDelete;
  }

  generateShortCode(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async isShortCodeUnique(shortCode: string) {
    try {
      const url = await this.repository.getByShortCode(shortCode);
      return !url;
    } catch {
      throw new Error(ErrorMessages.INTERNAL_ERROR_1);
    }
  }
}
