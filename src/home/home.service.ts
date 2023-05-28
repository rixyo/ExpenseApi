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
interface CreateHomeDto {
  price: number;
  state: string;
  images: { url: string }[];
  zip: string;
  city: string;
  propertyType: PropertyType;
  sqft: number;
  beds: number;
  baths: number;
  realtorId: string;
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
        images: true,
        messages: true,
      },
    });
    return new HomeResponseDto(home);
  }
  async createHome({
    price,
    baths,
    beds,
    city,
    propertyType,
    realtorId,
    sqft,
    state,
    zip,
    images,
  }: CreateHomeDto): Promise<HomeResponseDto> {
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
}
