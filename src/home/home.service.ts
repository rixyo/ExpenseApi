import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { v4 as uuid } from 'uuid';
interface Filters {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  beds?: number;
  baths?: number;
  propertyType?: PropertyType;
}
interface CreateHomeParams {
  price: number;
  state: string;
  images: { url: string }[];
  zip: string;
  city: string;
  propertyType: PropertyType;
  sqft: number;
  beds: number;
  baths: number;
}

interface UpdatedHomeParams {
  price?: number;
  state?: string;
  zip?: string;
  city?: string;
  propertyType?: PropertyType;
  sqft?: number;
  beds?: number;
  baths?: number;
}

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHomes(filter: Filters): Promise<HomeResponseDto[]> {
    const homes = await this.prisma.home.findMany({
      where: filter,
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
    if (!homes) {
      throw NotFoundException;
    }
    return homes.map((home) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new HomeResponseDto(fetchedHome);
    });
  }
  async getHomeById(id: string) {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!home) {
      throw NotFoundException;
    }
    return new HomeResponseDto(home);
  }
  async createHome(
    {
      price,
      baths,
      beds,
      city,
      propertyType,
      sqft,
      state,
      zip,
      images,
    }: CreateHomeParams,
    realtorId: string,
  ): Promise<HomeResponseDto> {
    const home = await this.prisma.home.create({
      data: {
        id: uuid(),
        price,
        baths,
        beds,
        city,
        propertyType,
        realtorId,
        sqft,
        state,
        zip,
      },
    });

    const homeImages = images.map((image) => ({ ...image, homeId: home.id }));
    await this.prisma.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }
  async updateHome(
    id: string,
    {
      price,
      baths,
      beds,
      city,
      propertyType,
      sqft,
      state,
      zip,
    }: UpdatedHomeParams,
  ): Promise<HomeResponseDto> {
    const homeExists = await this.prisma.home.findUnique({ where: { id } });
    if (!homeExists) throw new NotFoundException('Home not found');
    const home = await this.prisma.home.update({
      where: { id: homeExists.id },
      data: {
        price,
        baths,
        beds,
        city,
        propertyType,
        sqft,
        state,
        zip,
      },
    });
    return new HomeResponseDto(home);
  }
  async deleteHome(id: string): Promise<string> {
    const homeExists = await this.prisma.home.findUnique({ where: { id } });
    if (!homeExists) throw new NotFoundException('Home not found');
    await this.prisma.home.delete({ where: { id } });
    return 'deleted successfully';
  }
  async getRealtorByHomeId(id: string) {
    const home = await this.prisma.home.findUnique({
      where: { id },
      select: {
        realtor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!home) {
      throw NotFoundException;
    }
    return home;
  }
  async inquire(
    message: string,
    realtorId: string,
    homeId: string,
    buyerId: string,
  ) {
    return this.prisma.message.create({
      data: {
        id: uuid(),
        homeId: homeId,
        message: message,
        buyerId: buyerId,
        realtorId: realtorId,
      },
    });
  }
  async getMessages(homeId: string) {
    return this.prisma.message.findMany({
      where: {
        homeId: homeId,
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        home: {
          select: {
            id: true,
          },
        },
      },
    });
  }
  async searchHomes(query: string) {
    return this.prisma.home.findMany({
      where: {
        OR: [
          {
            state: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            zip: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
}
