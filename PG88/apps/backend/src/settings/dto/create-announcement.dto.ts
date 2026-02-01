import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementType } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: AnnouncementType })
  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateAnnouncementDto extends CreateAnnouncementDto {}
