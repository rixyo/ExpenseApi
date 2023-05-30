import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeService } from './home.service';

const mockGetHomes = [
  {
    id: '603ebc46-f717-4c7f-a63b-a1204ea90257',
    price: 155000000,
    state: 'Los Angeles, CA',
    baths: 18,
    beds: 9,
    city: '594 S Mapleton Dr',
    propertyType: PropertyType.SINGLE_FAMILY,
    sqft: 21000,
    zip: '90001',
    image:
      'https://ap.rdcpix.com/7fe86ba78ca7c45bc0e18b398e19416el-m3277750232od-w480_h360_x2.webp',

    images: [
      {
        url: 'sr1',
      },
    ],
  },
];
const mockGetHomeById = {
  id: 'ad0582bb-e015-4331-8199-4acee253a533',
  city: 'Beverly Hills',
  state: 'Los Angeles, CA',
  zip: '90001',
  propertyType: 'RESIDENTIAL',
  beds: 5,
  baths: 3,
  sqft: 21000,
  price: 54995000,
  images: [
    {
      url: 'https://ap.rdcpix.com/7fe86ba78ca7c45bc0e18b398e19416el-m3277750232od-w480_h360_x2.webp',
    },
    {
      url: 'https://ap.rdcpix.com/7fe86ba78ca7c45bc0e18b398e19416el-m999856342od-w1024_h768_x2.webp',
    },
  ],
};
describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockResolvedValue(mockGetHomes),
              findUnique: jest.fn().mockResolvedValue(mockGetHomeById),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });
  describe('getHomes', () => {
    const filters = {
      city: '594 S Mapleton Dr',
      price: {
        gte: 100000,
        lte: 155000000,
      },
    };
    it('should return an array of homes', async () => {
      const mockPrismaFindHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindHomes);
      await service.getHomes(filters);
      expect(mockPrismaFindHomes).toBeCalledWith({
        where: filters,
        select: {
          id: true,
          price: true,
          state: true,
          listed_date: true,
          baths: true,
          beds: true,
          city: true,
          propertyType: true,
          sqft: true,
          zip: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          listed_date: 'desc',
        },
      });
    });
  });
  describe('getHomeById', () => {
    const id = 'ad0582bb-e015-4331-8199-4acee253a533';
    it('should return a single home', async () => {
      const mockPrismaFindHomeById = jest.fn().mockReturnValue(mockGetHomeById);
      jest
        .spyOn(prismaService.home, 'findUnique')
        .mockImplementation(mockPrismaFindHomeById);
      await service.getHomeById(id);
      expect(mockPrismaFindHomeById).toBeCalledWith({
        where: { id },
        include: {
          images: {
            select: {
              url: true,
            },
          },
        },
      });
    });
  });
});
