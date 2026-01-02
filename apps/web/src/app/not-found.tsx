// Provide a simple App Router not-found boundary.
// next-on-pages may fail when relying on Next's internal default not-found implementation.
export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-border bg-card p-8 chamfer-lg scanlines">
        <div className="text-[10px] telemetry uppercase tracking-widest text-zinc-500">404</div>
        <h1 className="display mt-3 text-2xl font-black italic tracking-tight">Not found.</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you’re looking for doesn’t exist.</p>
        <a
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center border border-border px-4 text-xs font-bold tracking-widest uppercase chamfer-sm hover:border-accent hover:text-accent transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

