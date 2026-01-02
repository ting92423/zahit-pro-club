import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../rbac/roles.decorator';

type CreateOrderBody = {
  items: Array<{ sku_code: string; qty: number }>;
  shipping: { name: string; phone: string; email: string; address: string };
  sales_code?: string;
  points_to_redeem?: number;
};

type LookupOrderBody = { order_number: string; email: string };

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  async createGuestOrder(@Body() body: CreateOrderBody, @Req() req: any) {
    const memberId = req.user?.memberId;
    return { data: await this.orders.createGuestOrder({ ...body, memberId }) };
  }

  @Roles('MEMBER')
  @Get(':orderNumber')
  async getMyOrder(@Param('orderNumber') orderNumber: string, @Req() req: any) {
    return { data: await this.orders.getMemberOrder(req.user?.memberId, orderNumber) };
  }

  @Post('lookup')
  async lookupGuestOrder(@Body() body: LookupOrderBody) {
    return { data: await this.orders.lookupGuestOrder(body) };
  }

  @Post('report-atm-transfer')
  async reportAtmTransfer(@Body() body: LookupOrderBody) {
    return { data: await this.orders.reportAtmTransfer(body) };
  }
}

