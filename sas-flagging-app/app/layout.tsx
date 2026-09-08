import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAS Flagging System — PPE Traffic-Light Compliance',
  description: 'Sandock Austral Shipyards — PPE Traffic-Light Compliance and Escalation System',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#070d24',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23070d24'/><line x1='30' y1='20' x2='30' y2='80' stroke='%23ffffff' stroke-width='6' stroke-linecap='round'/><polygon points='38,22 55,27 55,42 38,47' fill='%23f2c14e'/><polygon points='55,27 70,32 70,37 55,42' fill='%23ef8550'/><polygon points='70,32 85,36 85,36 70,37' fill='%23f25c70'/><circle cx='30' cy='18' r='5' fill='%23ffffff'/></svg>" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
