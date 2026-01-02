import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(position?: string, tier: string = 'GUEST') {
    const where: any = {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
      ],
    };
    if (position) where.position = position;
    
    // Simple tier logic: guest sees all, or we could filter
    const ads = await this.prisma.adPlacement.findMany({ where, orderBy: { createdAt: 'desc' } });
    return ads;
  }

  async listAdmin() {
    return this.prisma.adPlacement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: any) {
    return this.prisma.adPlacement.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.adPlacement.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.adPlacement.delete({ where: { id } });
  }
}
