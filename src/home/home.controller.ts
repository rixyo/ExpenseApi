import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PropertyType, UserRole } from '@prisma/client';
import { User, userType } from 'src/user/decorators/user.decorator';
import {
  CreateHomeDto,
  HomeResponseDto,
  InqueryDto,
  UpdatedHomeDto,
} from './dto/home.dto';
import { HomeService } from './home.service';
import { Roles } from 'src/decorators/role.decorator';

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
    return await this.homeService.getHomes(filters);
  }
  @Get(':id')
  async getHomeById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HomeResponseDto> {
    return await this.homeService.getHomeById(id);
  }
  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @Post('')
  async createHome(@Body() body: CreateHomeDto, @User() user: userType) {
    return await this.homeService.createHome(body, user.id);
  }
  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @Patch(':id')
  async updateHome(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatedHomeDto,
    @User() user: userType,
  ): Promise<HomeResponseDto> {
    const home = await this.homeService.getRealtorByHomeId(id);
    if (home.realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return await this.homeService.updateHome(id, body);
  }
  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: userType,
  ) {
    const home = await this.homeService.getRealtorByHomeId(id);
    if (home.realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return await this.homeService.deleteHome(id);
  }
  @Roles(UserRole.BUYER)
  @Post(':id/inquire')
  async inquire(
    @Param('id', ParseUUIDPipe) homeId: string,
    @Body() body: InqueryDto,
    @User() user: userType,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(homeId);
    return await this.homeService.inquire(
      body.message,
      realtor.realtor.id,
      homeId,
      user.id,
    );
  }
  @Roles(UserRole.REALTOR)
  @Get(':id/messages')
  async getMessages(
    @Param('id', ParseUUIDPipe) homeId: string,
    @User() user: userType,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(homeId);
    if (realtor.realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return await this.homeService.getMessages(homeId);
  }
  @Get('search/:query')
  async searchHomes(@Param('query') query: string) {
    console.log(query);
    return await this.homeService.searchHomes(query);
  }
}
