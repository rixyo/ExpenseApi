import { PropertyType } from '.prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
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
  address: string;
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
  @IsPositive()
  price: number;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsString()
  @IsNotEmpty()
  address: string;
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
  @IsPositive()
  sqft: number;
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  beds: number;
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  baths: number;
}
class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}
export class UpdatedHomeDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  price?: number;
  @IsString()
  @IsOptional()
  state?: string;
  @IsString()
  @IsOptional()
  zip?: string;
  @IsString()
  @IsOptional()
  city?: string;
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;
  @IsInt()
  @IsPositive()
  @IsOptional()
  sqft?: number;
  @IsInt()
  @IsPositive()
  @IsOptional()
  beds?: number;
  @IsInt()
  @IsOptional()
  @IsPositive()
  baths?: number;
}
export class InqueryDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
