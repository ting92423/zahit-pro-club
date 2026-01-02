import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        skus: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            skuCode: true,
            price: true,
            memberPrice: true,
            stock: true,
          },
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      skus: p.skus.map((s) => ({
        sku_code: s.skuCode,
        price: s.price,
        member_price: s.memberPrice,
        stock: s.stock,
      })),
    }));
  }

  async get(id: string) {
    const p = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        skus: {
          orderBy: { createdAt: 'asc' },
          select: {
            skuCode: true,
            price: true,
            memberPrice: true,
            stock: true,
          },
        },
      },
    });

    if (!p) throw new NotFoundException('Product not found');

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      skus: p.skus.map((s) => ({
        sku_code: s.skuCode,
        price: s.price,
        member_price: s.memberPrice,
        stock: s.stock,
      })),
    };
  }
}

