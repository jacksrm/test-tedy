export class User {
  id: string;
  email: string;
  password: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  constructor(data: User) {
    Object.assign(this, data);
  }
}
