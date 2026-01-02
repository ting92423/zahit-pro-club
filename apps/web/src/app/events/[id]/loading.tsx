import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-sm)] bg-muted ${className}`} />;
}

export default function EventDetailLoading() {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hairline-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 carbon-fiber" />
      <SiteHeader />

      <main className="container-app py-10 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-6 w-20" />
        </div>

        <Card className="mt-6 surface-hover">
          <CardHeader>
            <Skeleton className="h-8 w-[70%]" />
            <Skeleton className="mt-3 h-4 w-[55%]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[76%]" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

