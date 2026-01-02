import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async report(input: { from?: string; to?: string }) {
    const where: any = {
      salesCode: { not: null },
    };

    const from = input.from ? new Date(input.from) : null;
    const to = input.to ? new Date(input.to) : null;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const rows = await this.prisma.order.groupBy({
      by: ['salesCode'],
      where,
      _count: { _all: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
    });

    return rows.map((r) => ({
      sales_code: r.salesCode as string,
      orders_count: r._count._all,
      total_amount: r._sum.totalAmount ?? 0,
    }));
  }
}

