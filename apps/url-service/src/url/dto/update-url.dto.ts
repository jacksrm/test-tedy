import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsOptional()
  @IsUrl({}, { message: 'Field must be a valid URL' })
  originalUrl?: string;

  @IsOptional()
  @IsString()
  shortCode?: string;
}
