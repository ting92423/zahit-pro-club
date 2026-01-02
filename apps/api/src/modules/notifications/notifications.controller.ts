import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Roles('MEMBER')
  @Get()
  async listForMember(
    @Req() req: any,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('type') type?: string,
    @Query('sort') sort?: 'latest' | 'unread',
  ) {
    const data = await this.notifications.listForMember(req.user.memberId, {
      take: take ? Number(take) : undefined,
      cursor: cursor || undefined,
      unreadOnly: unreadOnly === 'true',
      type: type || undefined,
      sort: sort === 'unread' ? 'unread' : 'latest',
    });
    const nextCursor = data.length > 0 ? data[data.length - 1].id : null;
    return { data, meta: { nextCursor } };
  }

  @Roles('MEMBER')
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return { data: await this.notifications.markAsRead(id, req.user.memberId) };
  }

  @Roles('MEMBER')
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    return { data: await this.notifications.markAllAsRead(req.user.memberId) };
  }

  @Roles('ADMIN')
  @Get('admin')
  async listAdmin() {
    return { data: await this.notifications.listAdmin() };
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: { memberId?: string; title: string; content: string; type?: string }) {
    return { data: await this.notifications.create(body) };
  }
}
