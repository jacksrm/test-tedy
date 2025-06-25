/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MockUserRepository } from './repository/mock/mock.user.repository';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorMessages } from '../error/messages';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersOptionsDto } from './dto/list-users-options.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { HashStringService } from '../hash-string/hash-string.service';

describe('UserService', () => {
  let users: User[];

  let service: UserService;
  let repository: MockUserRepository;

  beforeEach(async () => {
    users = [
      new User({
        id: '1',
        email: 'test@email.com',
        password: 'Password123!',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'test2@email.com',
        password: 'Password123!',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    repository = {
      create: jest.fn().mockImplementation(async (user: User) => user),
      findByEmail: jest.fn().mockImplementation(async () => users[0]),
      delete: jest.fn().mockImplementation(async (user: User) => user),
      findById: jest.fn().mockImplementation(async () => users[0]),
      update: jest.fn().mockImplementation(async (user: User) => user),
      list: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        HashStringService,
        { provide: UserRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-21T20:00:00.000Z'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('Should create a new user successfully given valid email, password, and optionally name', async () => {
      jest
        .spyOn(repository, 'findByEmail')
        .mockReturnValueOnce(Promise.resolve(null));
      const user: CreateUserDto = {
        email: 'test@email.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = await service.create(user);
      expect(repository.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(user.email);
      expect(result.name).toBe(user.name);
      expect(result.password).not.toBe(user.password);
      expect(result.createdAt).toBeDefined();
    });

    it('should fail if the email already exists', async () => {
      await expect(
        service.create({
          email: 'test@email.com',
          password: 'Password123!',
          name: 'Test User',
        }),
      ).rejects.toThrow(
        new BadRequestException(ErrorMessages.USER_ALREADY_EXISTS),
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.findByEmail).toHaveBeenCalledWith('test@email.com');
    });

    it('should normalize the email to lowercase', async () => {
      jest
        .spyOn(repository, 'findByEmail')
        .mockReturnValueOnce(Promise.resolve(null));
      const user: CreateUserDto = {
        email: 'TESt@email.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = await service.create(user);
      expect(repository.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(user.email.toLowerCase());
      expect(result.name).toBe(user.name);
      expect(result.password).not.toBe(user.password);
      expect(result.createdAt).toBeDefined();
    });

    it('should throw an error if database is down', async () => {
      jest
        .spyOn(repository, 'findByEmail')
        .mockRejectedValueOnce(new Error('Database is down'));
      const data = {
        email: 'test@email.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await expect(
        service.create({
          email: 'test@email.com',
          password: 'Password123!',
          name: 'Test User',
        }),
      ).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );

      jest
        .spyOn(repository, 'findByEmail')
        .mockReturnValueOnce(Promise.resolve(null));
      jest
        .spyOn(repository, 'create')
        .mockRejectedValueOnce(new Error('Database is down'));
      await expect(service.create(data)).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );
    });
  });

  describe('update', () => {
    it('should update user data successfully given valid data', async () => {
      jest
        .spyOn(repository, 'update')
        .mockImplementationOnce(async (user: User) => user);
      const id = '1';
      const updateEmail: UpdateUserDto = {
        email: 'new-email@example.com',
      };
      const updateName: UpdateUserDto = {
        name: 'New Name',
      };
      const updatePassword: UpdateUserDto = {
        password: 'New-password123!',
      };

      let result = await service.update(id, updateEmail);
      expect(result.email).toBe('new-email@example.com');

      result = await service.update(id, updateName);
      expect(result.name).toBe('New Name');

      result = await service.update(id, updatePassword);
      expect(result.password).not.toEqual(users[0].password);
    });

    it('should throw an error when trying to update a non-existent user', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockImplementationOnce(() => Promise.resolve(null));
      const id = '2';
      const data: UpdateUserDto = {};

      await expect(service.update(id, data)).rejects.toThrow(
        new BadRequestException(ErrorMessages.BAD_REQUEST_1),
      );
    });

    it('should throw an error when the email is already in use', async () => {
      jest
        .spyOn(repository, 'findByEmail')
        .mockImplementationOnce(async () => users[1]);

      const id = '1';
      const updateEmail: UpdateUserDto = { email: users[1].email };

      await expect(service.update(id, updateEmail)).rejects.toThrow(
        new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXISTS),
      );
    });

    it('should throw an error when the user is soft-deleted', async () => {
      jest.spyOn(repository, 'findById').mockImplementationOnce(
        async () =>
          new User({
            ...users[0],
            deletedAt: new Date(),
          }),
      );

      const id = '1';
      const data: UpdateUserDto = {};

      await expect(service.update(id, data)).rejects.toThrow(
        new BadRequestException(ErrorMessages.BAD_REQUEST_1),
      );
    });

    it('should throw an error if database is down', async () => {
      const id = '1';
      const email: UpdateUserDto = { email: 'test@test.com' };
      const email2: UpdateUserDto = { email: 'new-test@test.com' };

      jest
        .spyOn(repository, 'findByEmail')
        .mockRejectedValueOnce(new Error('Database is down'));

      await expect(service.update(id, email)).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );

      jest
        .spyOn(repository, 'findById')
        .mockRejectedValueOnce(new Error('Database is down'));
      await expect(service.update(id, email2)).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );

      jest
        .spyOn(repository, 'update')
        .mockRejectedValueOnce(new Error('Database is down'));

      await expect(service.update(id, email2)).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const id = '1';

      const result = await service.remove(id);
      expect(result.deletedAt).toBeDefined();
      expect(repository.delete).toHaveBeenCalledWith({
        ...users[0],
        deletedAt: new Date(),
      });
    });

    it('should throw if user does not exist', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      const id = '5';

      await expect(service.remove(id)).rejects.toThrow(
        new BadRequestException(ErrorMessages.BAD_REQUEST_1),
      );
    });

    it('Should throw an error if user already soft-deleted', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue({ ...users[0], deletedAt: new Date() });
      const id = '1';

      await expect(service.remove(id)).rejects.toThrow(
        new BadRequestException(ErrorMessages.BAD_REQUEST_1),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne(users[0].id);
      expect(result).toBeDefined();
      expect(result.id).toEqual(users[0].id);
      expect(result.email).toEqual(users[0].email);
      expect(result.name).toEqual(users[0].name);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      const id = '1';

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(ErrorMessages.USER_NOT_FOUND),
      );
    });

    it('should not return a soft-deleted user', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue({ ...users[0], deletedAt: new Date() });

      const id = '1';

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(ErrorMessages.USER_NOT_FOUND),
      );
    });

    it('should throw an error if user database is down', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockRejectedValue(new Error('Database is down'));
      await expect(service.findOne('1')).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users, with pagination and sorting', async () => {
      jest.spyOn(repository, 'list').mockResolvedValueOnce(users);
      const data: ListUsersOptionsDto = {};

      const result = await service.findAll(data);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[1]).toBeInstanceOf(UserResponseDto);
      expect(result).toHaveLength(2);
      expect(repository.list).toHaveBeenCalled();
    });

    it('should throw an error if user database is down', async () => {
      jest
        .spyOn(repository, 'list')
        .mockRejectedValue(new Error('Database is down'));
      const data: ListUsersOptionsDto = {};
      await expect(service.findAll(data)).rejects.toThrow(
        new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR_1),
      );
    });
  });
});
