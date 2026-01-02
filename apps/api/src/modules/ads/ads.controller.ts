import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { AdsService } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  @Get()
  async listPublic(@Query('position') position: string, @Req() req: any) {
    const tier = req.user?.tier || 'GUEST';
    return { data: await this.ads.listPublic(position, tier) };
  }

  @Roles('ADMIN')
  @Get('admin')
  async listAdmin() {
    return { data: await this.ads.listAdmin() };
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: any) {
    return { data: await this.ads.create(body) };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return { data: await this.ads.update(id, body) };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return { data: await this.ads.delete(id) };
  }
}
