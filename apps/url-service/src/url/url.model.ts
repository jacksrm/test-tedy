export class Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(data: Url) {
    Object.assign(this, data);
  }
}
