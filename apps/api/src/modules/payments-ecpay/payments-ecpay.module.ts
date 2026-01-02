import { Module } from '@nestjs/common';
import { PaymentsEcpayController } from './payments-ecpay.controller';
import { PaymentsEcpayService } from './payments-ecpay.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [MembersModule],
  controllers: [PaymentsEcpayController],
  providers: [PaymentsEcpayService],
})
export class PaymentsEcpayModule {}

