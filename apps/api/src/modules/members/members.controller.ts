import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Roles('ADMIN')
  @Get()
  async list(@Query('q') q?: string) {
    return { data: await this.members.listMembers(q) };
  }

  @Roles('ADMIN')
  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.members.getMember(id) };
  }

  @Roles('ADMIN')
  @Patch(':id/points')
  async adjustPoints(
    @Param('id') id: string,
    @Body() body: { points_delta: number; reason?: string },
  ) {
    return { data: await this.members.adjustPoints(id, body) };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string; tier?: string },
  ) {
    return { data: await this.members.updateMember(id, body) };
  }
}
