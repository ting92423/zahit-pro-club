import QRCode from 'qrcode';

export async function QrSvg({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const svg = await QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    width: 220,
    color: {
      dark: '#ffffff',
      light: '#00000000',
    },
  });

  return (
    <div
      className={className}
      // qrcode 套件輸出的 SVG 是可信來源（server 端生成）
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

