import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminSalesController } from './admin-sales.controller';
import { AdminSalesService } from './admin-sales.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminSalesController],
  providers: [AdminSalesService],
})
export class AdminSalesModule {}
