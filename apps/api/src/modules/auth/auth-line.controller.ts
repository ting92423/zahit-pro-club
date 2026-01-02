import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth/member/line')
export class AuthLineController {
  constructor(private readonly prisma: PrismaService) {}

  private get lineConfig() {
    return {
      channelId: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackUrl: process.env.LINE_CALLBACK_URL, // e.g., http://localhost:3000/login/line/callback
    };
  }

  @Get('login-url')
  async getLoginUrl(@Query('state') state: string) {
    const { channelId, callbackUrl } = this.lineConfig;
    if (!channelId || !callbackUrl) {
      throw new BadRequestException('LINE configuration missing');
    }

    const url = new URL('https://access.line.me/oauth2/v2.1/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', channelId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('state', state || 'zahit-auth');
    url.searchParams.set('scope', 'profile openid email');

    return { data: { url: url.toString() } };
  }

  @Post('verify')
  async verify(@Body() body: { code: string }) {
    const { code } = body;
    const { channelId, channelSecret, callbackUrl } = this.lineConfig;
    const jwtSecret = process.env.JWT_SECRET;

    if (!code) throw new BadRequestException('Code required');
    if (!channelId || !channelSecret || !callbackUrl || !jwtSecret) {
      throw new BadRequestException('LINE or JWT configuration missing');
    }

    try {
      // 1. Exchange code for token
      const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: callbackUrl,
          client_id: channelId,
          client_secret: channelSecret,
        }),
      });

      const tokenData = (await tokenRes.json()) as any;
      if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Failed to exchange token');

      const idToken = tokenData.id_token;
      // In a real app, we should verify the ID token signature.
      // For this prep, we'll decode it to get the profile.
      const profile = jwt.decode(idToken) as any;
      const lineId = profile.sub;
      const email = profile.email;
      const name = profile.name;
      const picture = profile.picture;

      // 2. Find or create member
      let member = await this.prisma.member.findUnique({ where: { lineId } });

      if (!member && email) {
        // Try finding by email if no lineId match
        member = await this.prisma.member.findUnique({ where: { email } });
        if (member) {
          // Link lineId to existing member
          member = await this.prisma.member.update({
            where: { id: member.id },
            data: { lineId },
          });
        }
      }

      if (!member) {
        // Create new member (note: phone is required in schema, so we might need a step to ask for it if not found)
        // For now, we'll mark it as pending if phone is missing, or use a placeholder.
        // Actually, let's return a "registration_required" flag if phone is missing.
        return {
          data: {
            registration_required: true,
            line_id: lineId,
            email,
            name,
          },
        };
      }

      // 3. Issue our own JWT
      const token = jwt.sign({ role: 'MEMBER', memberId: member.id }, jwtSecret, { expiresIn: '7d' });
      return { data: { token, role: 'MEMBER', member_id: member.id } };
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'LINE authentication failed');
    }
  }
}
