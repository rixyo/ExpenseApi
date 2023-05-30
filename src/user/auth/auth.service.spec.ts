import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest
                .fn()
                .mockResolvedValue(
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUml4eW8iLCJpZCI6ImFlNTY4MDlhLTIxOWYtNDlmZi1hNzU2LWZkNjA2OGU4MzNhMCIsImlhdCI6MTY4NTQ0NjU4MywiZXhwIjoxNjg1NTMyOTgzfQ.qybF_hbcAm16m9KOizRjs39rUvArQeMfwHLSp8aVraM',
                ),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('login', () => {
    const user = {
      email: 'rixy253@gmail.com',
      password: '3315@26Rix',
    };
    it('should return a token', async () => {
      const mockPrismaFindUser = jest.fn().mockReturnValue(user);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockImplementation(mockPrismaFindUser);
      await service.login(user);
      expect(mockPrismaFindUser).toBeCalledWith({
        where: {
          email: user.email,
          password: user.password,
        },
      });
    });
  });
});
