import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { CreateHomeDto, HomeResponseDto } from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  async getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('beds') beds?: string,
    @Query('baths') baths?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      maxPrice || minPrice
        ? {
            ...(minPrice && { gte: parseInt(minPrice) }),
            ...(maxPrice && { lte: parseInt(maxPrice) }),
          }
        : undefined;
    const filters = {
      ...(city && { city }),
      ...(beds && { beds: parseInt(beds) }),
      ...(baths && { baths: parseInt(baths) }),
      ...(propertyType && { propertyType }),
      ...(price && { price }),
    };
    // const homes = await this.homeService.getHomes(filters);
    return await this.homeService.getHomes(filters);
  }
  @Get(':id')
  async getHomeById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HomeResponseDto> {
    return await this.homeService.getHomeById(id);
  }
  @Post('')
  async createHome(@Body() body: CreateHomeDto) {
    return await this.homeService.createHome(body);
  }
}
