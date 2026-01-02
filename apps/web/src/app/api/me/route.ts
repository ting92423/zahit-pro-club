import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getMemberId } from '@/lib/auth-edge';
import { TIER_BENEFITS } from '@zahit/shared';

export const runtime = 'edge';

// GET /api/me
export async function GET(req: Request) {
  const memberId = await getMemberId();
  
  if (!memberId) {
    // Return explicit 401 so frontend can redirect to login
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
      include: {
        pointLedgers: { orderBy: { createdAt: 'desc' }, take: 20 },
        eventRegistrations: { orderBy: { createdAt: 'desc' }, take: 20, include: { event: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
        redemptions: { orderBy: { createdAt: 'desc' }, take: 20, include: { item: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ data: null });
    }

    const data = {
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      address: member.address ?? null,
      car: {
        brand: member.carBrand ?? null,
        model: member.carModel ?? null,
        year: member.carYear ?? null,
        plate: member.carPlate ?? null,
      },
      preferences: member.preferences ?? null,
      tier: member.tier,
      benefits: TIER_BENEFITS[member.tier as keyof typeof TIER_BENEFITS] ?? [],
      points_balance: member.pointsBalance,
      total_spent: member.totalSpent,
      notifications: member.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        type: n.type,
        is_read: n.isRead,
        created_at: n.createdAt,
      })),
      redemptions: member.redemptions.map((r) => ({
        id: r.id,
        status: r.status,
        qr_token: r.qrToken,
        redeemed_at: r.redeemedAt,
        created_at: r.createdAt,
        item: { title: r.item.title, description: r.item.description },
      })),
      point_ledger: member.pointLedgers.map((p) => ({
        id: p.id,
        type: p.type,
        points_delta: p.pointsDelta,
        reason: p.reason,
        created_at: p.createdAt,
      })),
      orders: member.orders.map((o) => ({
        id: o.id,
        order_number: o.orderNumber,
        status: o.status,
        total_amount: o.totalAmount,
        created_at: o.createdAt,
      })),
      registrations: member.eventRegistrations.map((r) => ({
        id: r.id,
        status: r.status,
        qr_token: r.qrToken,
        created_at: r.createdAt,
        event: {
          id: r.event.id,
          title: r.event.title,
          event_date: r.event.eventDate,
          location: r.event.location,
        },
      })),
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}

// PATCH /api/me
export async function PATCH(req: Request) {
  const memberId = await getMemberId();
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as any;
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body?.name?.trim();
  const phone = body?.phone?.trim();
  const address = body?.address?.trim();
  const carBrand = body?.car?.brand?.trim();
  const carModel = body?.car?.model?.trim();
  const carPlate = body?.car?.plate?.trim();
  const carYear = body?.car?.year;

  // Validation
  if (name !== undefined && (name.length < 2 || name.length > 50)) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (phone !== undefined && (phone.length < 8 || phone.length > 20)) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }
  if (address !== undefined && address.length > 200) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }
  if (carBrand !== undefined && carBrand.length > 50) return NextResponse.json({ error: 'Invalid car brand' }, { status: 400 });
  if (carModel !== undefined && carModel.length > 80) return NextResponse.json({ error: 'Invalid car model' }, { status: 400 });
  if (carPlate !== undefined && carPlate.length > 20) return NextResponse.json({ error: 'Invalid car plate' }, { status: 400 });
  
  if (carYear !== undefined && carYear !== null) {
    const y = Number(carYear);
    const now = new Date().getFullYear() + 1;
    if (!Number.isInteger(y) || y < 1950 || y > now) {
      return NextResponse.json({ error: 'Invalid car year' }, { status: 400 });
    }
  }

  const db = getDb();

  try {
    const updated = await db.member.update({
      where: { id: memberId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(carBrand !== undefined ? { carBrand } : {}),
        ...(carModel !== undefined ? { carModel } : {}),
        ...(carYear !== undefined ? { carYear: carYear === null ? null : Number(carYear) } : {}),
        ...(carPlate !== undefined ? { carPlate } : {}),
        ...(body.preferences !== undefined ? { preferences: body.preferences } : {}),
      },
    });

    const data = {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      address: updated.address ?? null,
      car: {
        brand: updated.carBrand ?? null,
        model: updated.carModel ?? null,
        year: updated.carYear ?? null,
        plate: updated.carPlate ?? null,
      },
      preferences: updated.preferences ?? null,
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
