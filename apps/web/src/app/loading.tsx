export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-none bg-accent opacity-20 chamfer-sm" />
          <div className="relative flex h-12 w-12 items-center justify-center border border-accent bg-background chamfer-sm">
            <div className="h-3 w-3 bg-accent animate-pulse" />
          </div>
        </div>
        <div className="font-mono text-xs tracking-[0.3em] text-muted-foreground animate-pulse">
          SYSTEM INITIALIZING...
        </div>
      </div>
    </div>
  );
}
