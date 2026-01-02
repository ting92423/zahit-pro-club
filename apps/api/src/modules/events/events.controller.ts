import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Roles('ADMIN')
  @Get()
  async listAdmin() {
    return { data: await this.events.listAdminEvents() };
  }

  @Get('public')
  async listPublic() {
    return { data: await this.events.listPublicEvents() };
  }

  @Get('public/:id')
  async getPublic(@Param('id') id: string) {
    return { data: await this.events.getPublicEvent(id) };
  }

  @Post(':id/register')
  async register(
    @Param('id') id: string,
    @Body() body: { name: string; phone: string; email: string; memberId?: string },
  ) {
    return { data: await this.events.register(id, body) };
  }

  @Roles('ADMIN', 'STAFF')
  @Post('checkin')
  async checkIn(@Body() body: { qr_token: string }) {
    return { data: await this.events.checkIn(body.qr_token) };
  }

  @Roles('ADMIN')
  @Post()
  async create(
    @Body()
    body: {
      title: string;
      description?: string;
      location?: string;
      eventDate: string;
      maxSlots: number;
      price: number;
      minTier?: string;
    },
  ) {
    return { data: await this.events.createEvent(body) };
  }

  @Roles('ADMIN')
  @Get(':id/registrations')
  async registrations(@Param('id') id: string) {
    return { data: await this.events.getRegistrations(id) };
  }
}
