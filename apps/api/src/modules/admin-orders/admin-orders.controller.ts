import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { Roles } from '../rbac/roles.decorator';
import { AdminOrdersService } from './admin-orders.service';

@Roles('ADMIN')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  async list(@Query('status') status?: string, @Query('q') q?: string) {
    // status 支援：
    // - 單一值：PAID
    // - 多值（逗號分隔）：UNPAID,PAID,FULFILLING
    return { data: await this.orders.list({ status, q }) };
  }

  @Get(':orderNumber')
  async get(@Param('orderNumber') orderNumber: string) {
    return { data: await this.orders.get(orderNumber) };
  }

  @Patch(':orderNumber/status')
  async updateStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() body: { status: OrderStatus; force?: boolean },
  ) {
    return { data: await this.orders.updateStatus(orderNumber, body.status, body.force) };
  }

  @Patch(':orderNumber/shipping')
  async updateShipping(
    @Param('orderNumber') orderNumber: string,
    @Body() body: { carrier?: string; tracking_no?: string },
  ) {
    return { data: await this.orders.updateShipping(orderNumber, body) };
  }
}

