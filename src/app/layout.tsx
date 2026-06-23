import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import AlertProvider from '@/components/alert-provider';
import AppShell from '@/components/app-shell';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Auto Voice Alert — ระบบแจ้งเตือนเสียงอัตโนมัติ',
  description: 'ระบบแจ้งเตือนเสียงอัตโนมัติสำหรับโรงงาน',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full overflow-hidden">
        <AlertProvider>
          <AppShell>{children}</AppShell>
        </AlertProvider>
      </body>
    </html>
  );
}
