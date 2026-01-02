import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-sm)] bg-muted ${className}`} />;
}

export default function EventsLoading() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-40" />
            <Skeleton className="mt-3 h-4 w-[min(520px,70vw)]" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="surface-hover">
              <CardHeader>
                <Skeleton className="h-6 w-[70%]" />
                <Skeleton className="mt-2 h-4 w-[55%]" />
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-9 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

