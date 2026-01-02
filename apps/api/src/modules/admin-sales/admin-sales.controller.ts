import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../rbac/roles.decorator';
import { AdminSalesService } from './admin-sales.service';

@Roles('ADMIN')
@Controller('admin/sales')
export class AdminSalesController {
  constructor(private readonly sales: AdminSalesService) {}

  @Get('report')
  async report(@Query('from') from?: string, @Query('to') to?: string) {
    return { data: await this.sales.report({ from, to }) };
  }
}
