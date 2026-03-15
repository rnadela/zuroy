import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zuroy Portal',
  description: 'Internal admin — fleet, partners, branding',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
