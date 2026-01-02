import { Module } from '@nestjs/common';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
})
export class RedemptionsModule {}
