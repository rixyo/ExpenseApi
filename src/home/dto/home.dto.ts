import { PropertyType } from '.prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: string;
  price: number;
  state: string;
  @Exclude()
  listed_date: Date;
  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listedDate;
  }
  image: string;
  zip: string;
  city: string;
  propertyType: PropertyType;
  sqft: number;
  beds: number;
  baths: number;
  @Exclude()
  realtorId: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}
export class CreateHomeDto {
  @IsInt()
  @IsNotEmpty()
  price: number;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
  @IsString()
  @IsNotEmpty()
  zip: string;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsEnum(PropertyType)
  propertyType: PropertyType;
  @IsInt()
  @IsNotEmpty()
  sqft: number;
  @IsInt()
  @IsNotEmpty()
  beds: number;
  @IsInt()
  @IsNotEmpty()
  baths: number;
  @IsString()
  @IsNotEmpty()
  realtorId: string;
}
class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}
