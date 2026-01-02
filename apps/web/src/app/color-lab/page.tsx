'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ThemeMode = 'night' | 'day';

type ThemeVars = Record<`--${string}`, string>;

const NIGHT: ThemeVars = {
  // Night (Cockpit V12 - Ultimate Visibility)
  '--background': '#000000',
  '--foreground': '#FFFFFF',
  '--card': '#1A1A1C',
  '--card-foreground': '#FFFFFF',
  '--muted': '#252528',
  '--muted-foreground': '#CCCCCC', /* Zinc-300: extremely bright for a "muted" color */
  '--border': '#333336',
  '--accent': '#FF3B30',
  '--accent-2': '#FFCC00',
  '--accent-3': '#32D74B',
  '--grid': 'transparent',
  '--scanline': 'transparent',
};

const DAY_EDITORIAL: ThemeVars = {
  // Day (Editorial V12 - Ultimate Visibility)
  '--background': '#E5E5E7',       /* Darker grey background to make cards pop */
  '--foreground': '#000000',
  '--card': '#FFFFFF',
  '--card-foreground': '#000000',
  '--muted': '#D1D1D6',
  '--muted-foreground': '#48484A', /* Darker grey for clear reading on white */
  '--border': '#C7C7CC',
  '--accent': '#AF0000',
  '--accent-2': '#8E6A00',
  '--accent-3': '#248A3D',
  '--grid': 'transparent',
  '--scanline': 'transparent',
};

function varsFor(mode: ThemeMode): ThemeVars {
  return mode === 'night' ? NIGHT : DAY_EDITORIAL;
}

export default function ColorLabPage() {
  const [mode, setMode] = useState<ThemeMode>('night');
  const v = useMemo(() => varsFor(mode), [mode]);

  // V13 - Force physical visibility by bypassing variables where needed
  const isNight = mode === 'night';
  const forceBg = isNight ? '#000000' : '#F5F5F5';
  const forceFg = isNight ? '#FFFFFF' : '#111111';
  const forceMuted = isNight ? '#A1A1AA' : '#737373'; // Zinc-400 vs Zinc-500
  const forceCard = isNight ? '#111111' : '#FFFFFF';
  const forceBorder = isNight ? '#333333' : '#D1D1D1';

  return (
    <div
      style={{
        backgroundColor: forceBg,
        color: forceFg,
        minHeight: '100vh',
        colorScheme: isNight ? 'dark' : 'light',
      }}
    >
      <main className="container-app py-10 sm:py-14">
        {/* Toggle UI */}
        <div className="flex justify-between items-center mb-10 border-b pb-6" style={{ borderColor: forceBorder }}>
          <h1 className="display text-3xl font-black italic tracking-tighter" style={{ color: isNight ? '#FF1E1E' : '#B4000B' }}>
            ZAHIT COLOR LAB <span style={{ color: forceMuted }}>V13</span>
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setMode('day')}
              className="px-4 py-2 text-xs font-bold chamfer-sm border transition-all"
              style={{ 
                backgroundColor: !isNight ? '#B4000B' : 'transparent',
                color: !isNight ? '#FFFFFF' : forceFg,
                borderColor: !isNight ? '#B4000B' : forceBorder
              }}
            >DAY / EDITORIAL</button>
            <button 
              onClick={() => setMode('night')}
              className="px-4 py-2 text-xs font-bold chamfer-sm border transition-all"
              style={{ 
                backgroundColor: isNight ? '#FF1E1E' : 'transparent',
                color: isNight ? '#FFFFFF' : forceFg,
                borderColor: isNight ? '#FF1E1E' : forceBorder
              }}
            >NIGHT / COCKPIT</button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Text Test Section */}
          <section className="space-y-6">
            <div className="p-8 border-2" style={{ backgroundColor: forceCard, borderColor: forceBorder }}>
              <div className="text-[10px] font-bold tracking-widest mb-4" style={{ color: isNight ? '#FFCC00' : '#9A6A12' }}>[ TYPOGRAPHY PROTOCOL ]</div>
              <h2 className="text-4xl font-black mb-2" style={{ color: forceFg }}>THIS IS PRIMARY TEXT</h2>
              <p className="text-xl leading-relaxed" style={{ color: forceMuted }}>
                This is secondary (muted) text. It should be perfectly readable but clearly lighter than the heading.
              </p>
              <div className="mt-6 pt-6 border-t" style={{ borderColor: forceBorder }}>
                <p className="text-sm italic" style={{ color: forceMuted }}>
                  "Precision is the only luxury that matters." — Zählt Engineering
                </p>
              </div>
            </div>

            {/* Contrast Ramp */}
            <div className="grid grid-cols-5 h-12 border" style={{ borderColor: forceBorder }}>
              <div style={{ backgroundColor: '#FFFFFF' }} title="Pure White"></div>
              <div style={{ backgroundColor: '#A1A1AA' }} title="Zinc-400"></div>
              <div style={{ backgroundColor: '#71717A' }} title="Zinc-500"></div>
              <div style={{ backgroundColor: '#3F3F46' }} title="Zinc-700"></div>
              <div style={{ backgroundColor: '#000000' }} title="Pure Black"></div>
            </div>
          </section>

          {/* Component Test Section */}
          <section className="space-y-6">
            <div className="p-8 border-2" style={{ backgroundColor: forceCard, borderColor: forceBorder }}>
              <div className="text-[10px] font-bold tracking-widest mb-4" style={{ color: isNight ? '#FFCC00' : '#9A6A12' }}>[ SYSTEM STATUS ]</div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center p-4 border" style={{ borderColor: forceBorder, backgroundColor: isNight ? '#000000' : '#F9F9F9' }}>
                  <span className="font-mono text-sm uppercase tracking-wider">Telemetry Connection</span>
                  <span className="font-bold" style={{ color: '#32D74B' }}>STABLE</span>
                </div>
                <div className="flex justify-between items-center p-4 border" style={{ borderColor: '#FF1E1E', backgroundColor: '#FF1E1E10' }}>
                  <span className="font-mono text-sm uppercase tracking-wider" style={{ color: isNight ? '#FF1E1E' : '#B4000B' }}>Critical Warning</span>
                  <span className="font-bold" style={{ color: isNight ? '#FF1E1E' : '#B4000B' }}>ACTIVE</span>
                </div>
                <div className="flex justify-between items-center p-4 border" style={{ borderColor: isNight ? '#FFCC00' : '#9A6A12', backgroundColor: isNight ? '#FFCC0010' : '#9A6A1210' }}>
                  <span className="font-mono text-sm uppercase tracking-wider" style={{ color: isNight ? '#FFCC00' : '#9A6A12' }}>Countdown Sequence</span>
                  <span className="font-mono" style={{ color: isNight ? '#FFCC00' : '#9A6A12' }}>T-00:14:59</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* The ultimate test anchor */}
        <div className="mt-20 p-10 border-4 border-dashed text-center" style={{ borderColor: isNight ? '#FF1E1E' : '#B4000B' }}>
          <h3 className="text-2xl font-bold mb-4">IF YOU CANNOT READ THE TEXT BELOW, REFRESH THE BROWSER</h3>
          <div style={{ color: forceMuted }} className="text-3xl font-black italic uppercase">
            MUTED TEXT VISIBILITY TEST
          </div>
        </div>
      </main>
    </div>
  );
}

