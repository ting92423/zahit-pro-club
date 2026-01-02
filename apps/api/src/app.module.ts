import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { AdminOrdersModule } from './modules/admin-orders/admin-orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsEcpayModule } from './modules/payments-ecpay/payments-ecpay.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { MembersModule } from './modules/members/members.module';
import { EventsModule } from './modules/events/events.module';
import { MeModule } from './modules/me/me.module';
import { AdminSalesModule } from './modules/admin-sales/admin-sales.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdsModule } from './modules/ads/ads.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { RolesGuard } from './modules/rbac/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    PaymentsEcpayModule,
    AdminOrdersModule,
    MembersModule,
    EventsModule,
    MeModule,
    AdminSalesModule,
    NotificationsModule,
    AdsModule,
    RedemptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
