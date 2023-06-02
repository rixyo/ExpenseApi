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
  address: string;
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
  address?: string;
  propertyType?: PropertyType;
  sqft?: number;
  beds?: number;
  baths?: number;
}

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHomes(
    filter: Filters,
    page: number,
    perPage: number,
  ): Promise<HomeResponseDto[]> {
    const skip = (page - 1) * perPage;
    const take = parseInt(`${perPage}`);

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
        address: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      skip,
      take,
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
      address,
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
        address,
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
  async getMessages(realtorId: string) {
    const messages = this.prisma.message.findMany({
      where: {
        realtorId: realtorId,
      },
      select: {
        message: true,
        created_at: true,
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
            price: true,
            address: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    if (!messages) {
      throw NotFoundException;
    }
    return messages;
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
  async getRealtorHomes(realtorId: string, page: number, perPage: number) {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const homes = await this.prisma.home.findMany({
      where: {
        realtorId: realtorId,
      },
      select: {
        id: true,
        address: true,
        city: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      skip,
      take,
      orderBy: {
        listed_date: 'desc',
      },
    });
    if (!homes) throw NotFoundException;
    return homes.map((home) => {
      const fetchedHome = { ...home, image: home.images[0].url };
      delete fetchedHome.images;
      return new HomeResponseDto(fetchedHome);
    });
  }
}
