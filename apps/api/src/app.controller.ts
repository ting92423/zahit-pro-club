import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './modules/rbac/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/ping')
  @Roles('ADMIN')
  adminPing() {
    return { ok: true, scope: 'admin' };
  }
}
