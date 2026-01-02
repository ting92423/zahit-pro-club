import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateOtpCode() {
  // 6-digit
  return String(Math.floor(100000 + Math.random() * 900000));
}

@Controller('auth/member')
export class AuthMemberController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 不串接 Email 發信：先回傳 dev_code 供測試/驗收。
   * 後續要串接寄信時，僅需把 dev_code 改成寄送即可，資料表不變。
   */
  @Post('request-otp')
  async requestOtp(@Body() body: { email?: string }) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new BadRequestException('JWT_SECRET not configured');

    const email = normalizeEmail(body?.email ?? '');
    if (!email) throw new BadRequestException('Email required');

    const member = await this.prisma.member.findUnique({ where: { email } });

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.memberOtp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    return {
      data: {
        ok: true,
        email,
        is_existing_member: !!member,
        // 開發模式 OTP（不串接外部寄信）
        dev_code: code,
        expires_at: expiresAt,
      },
    };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body()
    body: { email?: string; code?: string; name?: string; phone?: string },
  ) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new BadRequestException('JWT_SECRET not configured');

    const email = normalizeEmail(body?.email ?? '');
    const code = String(body?.code ?? '').trim();
    if (!email || !code) throw new BadRequestException('Email and code required');

    // 找最新一筆未使用且未過期的 OTP
    const otp = await this.prisma.memberOtp.findFirst({
      where: {
        email,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new BadRequestException('Invalid or expired code');

    await this.prisma.memberOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    let member = await this.prisma.member.findUnique({ where: { email } });

    if (!member) {
      const name = String(body?.name ?? '').trim();
      const phone = String(body?.phone ?? '').trim();
      if (!name || !phone) {
        throw new BadRequestException('New member requires name and phone');
      }

      member = await this.prisma.member.create({
        data: {
          name,
          phone,
          email,
        },
      });
    }

    const token = jwt.sign({ role: 'MEMBER', memberId: member.id }, jwtSecret, { expiresIn: '7d' });
    return { data: { token, role: 'MEMBER', member_id: member.id } };
  }
}

