import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { RedemptionsService } from './redemptions.service';

@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly redemptions: RedemptionsService) {}

  @Get('items')
  async listPublic() {
    return { data: await this.redemptions.listPublicItems() };
  }

  @Roles('MEMBER')
  @Post('redeem')
  async redeem(@Req() req: any, @Body() body: { itemId: string }) {
    return {
      data: await this.redemptions.redeem(req.user.memberId, body.itemId),
    };
  }

  @Roles('ADMIN', 'STAFF')
  @Post('verify')
  async verify(@Body() body: { qr_token: string }) {
    return { data: await this.redemptions.verify(body.qr_token) };
  }

  @Roles('ADMIN')
  @Get('admin/items')
  async listAdmin() {
    return { data: await this.redemptions.listAdminItems() };
  }

  @Roles('ADMIN')
  @Post('admin/items')
  async create(@Body() body: any) {
    return { data: await this.redemptions.createItem(body) };
  }

  @Roles('ADMIN')
  @Patch('admin/items/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return { data: await this.redemptions.updateItem(id, body) };
  }
}
