'use client';

import { useEffect, useMemo, useState } from 'react';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <span className="font-mono tabular-nums">
      T-{pad2(h)}:{pad2(m)}:{pad2(sec)}
    </span>
  );
}

