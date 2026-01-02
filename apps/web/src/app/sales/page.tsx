import { SiteHeader } from '@/components/site-header';

export default function SalesHomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="text-xl font-semibold tracking-tight">業務（Sales）</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          之後會放：專屬 QR/連結、歸因成交、可結算/已結算、回沖原因。
        </p>
      </main>
    </div>
  );
}

