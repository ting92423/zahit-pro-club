import { SiteHeader } from '@/components/site-header';

const LINKS = [
  { label: '品牌官網', url: '/', icon: '🌐' },
  { label: '加入 LINE 好友', url: 'https://line.me', icon: '💬' },
  { label: 'Facebook 粉絲專頁', url: 'https://facebook.com', icon: '👥' },
  { label: 'Instagram', url: 'https://instagram.com', icon: '📸' },
  { label: 'YouTube 頻道', url: 'https://youtube.com', icon: '🎥' },
];

export default function LinkHubPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center text-3xl">
          ☕
        </div>
        <h1 className="mt-4 text-2xl font-bold">Zählt × 平交道咖啡</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pro友俱樂部｜一鍵連結官方資訊</p>

        <div className="mt-10 space-y-4">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full rounded-full border border-border bg-card py-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span className="mr-2">{l.icon}</span>
              {l.label}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
