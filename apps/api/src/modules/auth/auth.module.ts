import { Module } from '@nestjs/common';
import { AuthAdminController } from './auth-admin.controller';
import { AuthMemberController } from './auth-member.controller';
import { AuthLineController } from './auth-line.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthAdminController, AuthMemberController, AuthLineController],
})
export class AuthModule {}

