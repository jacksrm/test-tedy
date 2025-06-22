import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDTO } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

@Controller()
export class UrlController {
  constructor(private service: UrlService) {}

  @Post('shorten')
  async shorten(@Body() body: CreateUrlDTO, @Req() req: Request) {
    const userId = req.headers['x-user-id'] as string | undefined; // Krakend passes token payload via header
    return this.service.shorten({
      originalUrl: body.originalUrl,
      userId,
    });
  }

  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.service.getUrlByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('Short code not found');
    }
    return { statusCode: HttpStatus.FOUND, url: url.originalUrl };
  }

  @Get('me/urls')
  async listUserUrls(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.service.list({
      userId,
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Patch('me/urls/:id')
  async updateUrl(
    @Param('id') id: string,
    @Body() dto: UpdateUrlDto,
    @Req() req: Request,
  ) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.service.update({
      id,
      userId,
      originalUrl: dto.originalUrl,
      shortCode: dto.shortCode,
    });
  }

  @Delete('me/urls/:id')
  async deleteUrl(@Param('id') id: string, @Req() req: Request) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.service.delete({
      id,
      userId,
    });
  }
}
