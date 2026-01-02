'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MemberProfileClient({
  initialName,
  initialPhone,
  initialAddress,
  initialCar,
}: {
  initialName: string;
  initialPhone: string;
  initialAddress?: string;
  initialCar?: { brand?: string; model?: string; year?: number; plate?: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress || '');
  const [carBrand, setCarBrand] = useState(initialCar?.brand || '');
  const [carModel, setCarModel] = useState(initialCar?.model || '');
  const [carYear, setCarYear] = useState(initialCar?.year ? String(initialCar.year) : '');
  const [carPlate, setCarPlate] = useState(initialCar?.plate || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          car: {
            brand: carBrand,
            model: carModel,
            year: carYear ? Number(carYear) : undefined,
            plate: carPlate,
          },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? 'Save failed');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operator Name // 姓名</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Comm Protocol // 手機</span>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deployment Base // 地址</span>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
        </label>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
          <div className="col-span-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Vehicle Telemetry // 載具數據</div>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brand</span>
            <Input value={carBrand} onChange={(e) => setCarBrand(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</span>
            <Input value={carModel} onChange={(e) => setCarModel(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Year</span>
            <Input value={carYear} onChange={(e) => setCarYear(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plate</span>
            <Input value={carPlate} onChange={(e) => setCarPlate(e.target.value)} className="chamfer-sm border-zinc-800 bg-zinc-950/50 focus:border-accent" />
          </label>
        </div>
      </div>
      <Button onClick={save} disabled={isSaving} className="w-full skew-cta py-6 font-bold tracking-[0.2em] shadow-lg">
        {isSaving ? 'UPLOADING...' : 'UPDATE PROFILE DATA'}
      </Button>
      {error ? (
        <div className="border border-red-900/50 bg-red-900/10 p-3 text-[10px] text-red-400 telemetry uppercase chamfer-sm">
          [ ERROR ]: {error}
        </div>
      ) : null}
    </div>
  );
}

