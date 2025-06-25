import { IsString, IsUrl } from 'class-validator';

export class CreateUrlDTO {
  @IsUrl({}, { message: 'Field must be a valid URL' })
  @IsString()
  originalUrl: string;
}
