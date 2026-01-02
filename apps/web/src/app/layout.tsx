import type { Metadata } from 'next';
import { Chakra_Petch, Noto_Sans_TC, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import { SalesTracker } from '@/components/sales-tracker';
import { I18nProvider } from '@/i18n/provider';
import { getDict, getLang } from '@/lib/i18n';
import { MobileNav } from '@/components/mobile-nav';
import { CommandMenu } from '@/components/command-menu';
import { ThemeProvider } from '@/components/theme-provider';

// Cloudflare Pages requires Edge Runtime for non-static routes when using next-on-pages.
export const runtime = 'edge';

const bodySans = Noto_Sans_TC({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Redline headings (bold + italic)
const display = Chakra_Petch({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

// Telemetry / data readouts (mono-ish)
const telemetry = Share_Tech_Mono({
  variable: '--font-telemetry',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Zahit｜Pro友俱樂部',
  description: '以使用者體驗為核心的會員/點數/活動/電商/分潤整合平台',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDict();
  const lang = await getLang();

  return (
    <html lang={lang === 'zh' ? 'zh-Hant' : 'en'}>
      <body
        className={`${bodySans.variable} ${display.variable} ${telemetry.variable} antialiased min-h-screen bg-background text-foreground selection:bg-accent selection:text-white`}
      >
        <ThemeProvider>
          <I18nProvider dict={dict} lang={lang}>
            <SalesTracker />
            {children}
            <MobileNav />
            <CommandMenu />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
