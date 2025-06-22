import { ListUrlOptions } from 'src/url/dto/list-url-options.dto';
import { Url } from 'src/url/url.model';
import { UrlRepository } from '../url.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostgresRepository implements UrlRepository {
  constructor(private client: PrismaService) {}

  async list(options: ListUrlOptions): Promise<Url[]> {
    const { userId, limit = 20, page = 1 } = options;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    const urls = await this.client.url.findMany({
      where: { userId, deletedAt: null },
      take: limit,
      skip: startIndex,
      orderBy: { createdAt: 'desc' },
    });

    return urls.map(
      (url) =>
        new Url({
          ...url,
          userId: url.userId ?? undefined,
          deletedAt: url.deletedAt ?? undefined,
        }),
    );
  }
  async save(data: Url): Promise<Url> {
    const exists = await this.client.url.findUnique({
      where: { id: data.id },
    });

    if (exists) {
      await this.client.url.update({
        data: {
          ...data,
          userId: data.userId ?? null,
          deletedAt: data.deletedAt ?? null,
        },
        where: { id: data.id },
      });
    } else {
      await this.client.url.create({ data });
    }

    return data;
  }
  async getById(id: string): Promise<Url | undefined> {
    const url = await this.client.url.findUnique({ where: { id } });
    if (!url) return;

    return new Url({
      ...url,
      userId: url.userId ?? undefined,
      deletedAt: url.deletedAt ?? undefined,
    });
  }
  async delete(id: string): Promise<void> {
    const url = await this.client.url.findUnique({ where: { id } });
    if (!url) return;
    await this.client.url.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  async getByShortCode(shortCode: string): Promise<Url | undefined> {
    const url = await this.client.url.findUnique({ where: { shortCode } });
    if (!url) return;
    return new Url({
      ...url,
      userId: url.userId ?? undefined,
      deletedAt: url.deletedAt ?? undefined,
    });
  }
  async getByUserId(userId: string): Promise<Url[]> {
    const urls = await this.client.url.findMany({ where: { userId } });
    return urls.map(
      (url) =>
        new Url({
          ...url,
          userId: url.userId ?? undefined,
          deletedAt: url.deletedAt ?? undefined,
        }),
    );
  }
}
