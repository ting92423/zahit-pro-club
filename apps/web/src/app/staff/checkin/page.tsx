import { SiteHeader } from '@/components/site-header';

export default function StaffCheckinPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-xl font-semibold tracking-tight">現場掃碼（Staff）</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          目標是 10 秒內完成：打開 → 掃描 → 顯示結果（成功/已核銷/過期/不符）。
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-medium">掃描區（樣板）</div>
          <div className="mt-2 text-sm text-muted-foreground">之後會接相機掃描與手動輸入 token。</div>
        </div>
      </main>
    </div>
  );
}

