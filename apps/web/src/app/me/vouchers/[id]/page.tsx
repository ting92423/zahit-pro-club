import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrSvg } from '@/components/dashboard/qr-svg';

type Redemption = {
  id: string;
  status: string;
  qr_token: string;
  redeemed_at?: string | null;
  created_at: string;
  item: { title: string; description: string | null };
};

type MeDto = {
  redemptions: Redemption[];
};

async function getMe(): Promise<MeDto> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/me`, { cache: 'no-store' });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.data as MeDto;
}

export default async function VoucherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getMe();
  const v = me.redemptions.find((r) => r.id === id);
  if (!v) notFound();

  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-40" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-3xl font-semibold tracking-tight">憑證詳情</h1>
            <div className="mt-2 text-sm text-muted-foreground telemetry">{v.item.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={v.status === 'ISSUED' ? 'accent' : 'muted'}>{v.status}</Badge>
            <Link href="/me">
              <Button variant="secondary">返回會員中心</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="surface-hover chamfer-lg">
            <CardHeader>
              <CardTitle className="display text-lg">QR 憑證</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center border border-border bg-white p-4 chamfer-sm">
                <QrSvg className="h-[240px] w-[240px]" text={`zahit://voucher/${v.qr_token}`} />
              </div>
              <div className="border border-border bg-background/30 p-4 chamfer-sm">
                <div className="text-xs text-muted-foreground">TOKEN</div>
                <div className="mt-2 font-mono text-xs break-all">{v.qr_token}</div>
              </div>
              {v.item.description ? (
                <div className="text-sm text-muted-foreground leading-relaxed">{v.item.description}</div>
              ) : null}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">狀態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="建立" value={new Date(v.created_at).toLocaleString()} />
                <Row label="核銷" value={v.redeemed_at ? new Date(v.redeemed_at).toLocaleString() : '—'} />
              </CardContent>
            </Card>

            <Card className="surface-hover chamfer-lg">
              <CardHeader>
                <CardTitle className="display text-lg">使用說明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <div>— 到現場出示此 QR 憑證，由工作人員掃描核銷。</div>
                <div>— 核銷後狀態會更新為 REDEEMED。</div>
                <div>— 若遇到問題，請提供 TOKEN 以便查詢。</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-right">{value}</div>
    </div>
  );
}

