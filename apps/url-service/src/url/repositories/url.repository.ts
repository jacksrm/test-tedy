import { ListUrlOptions } from '../dto/list-url-options.dto';
import { Url } from '../url.model';

export abstract class UrlRepository {
  abstract list(options: ListUrlOptions): Promise<Url[]>;
  abstract save(data: Url): Promise<Url>;
  abstract getById(id: string): Promise<Url | undefined>;
  abstract delete(id: string): Promise<void>;
  abstract getByShortCode(shortCode: string): Promise<Url | undefined>;
  abstract getByUserId(userId: string): Promise<Url[]>;
}
