import { User } from '../entities/user.entity';

export class AllUsersResponseDto {
  users: User[];
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
