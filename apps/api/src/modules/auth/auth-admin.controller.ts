import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Controller('auth/admin')
export class AuthAdminController {
  @Post('login')
  async login(@Body() body: { password?: string }) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword) throw new BadRequestException('ADMIN_PASSWORD not configured');
    if (!jwtSecret) throw new BadRequestException('JWT_SECRET not configured');

    if (!body?.password || body.password !== adminPassword) {
      throw new BadRequestException('Invalid password');
    }

    const token = jwt.sign({ role: 'ADMIN' }, jwtSecret, { expiresIn: '7d' });
    return { data: { token, role: 'ADMIN' } };
  }
}

