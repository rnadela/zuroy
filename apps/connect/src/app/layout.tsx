import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zuroy Connect',
  description: 'Hotel staff — reservations, check-in/out, NFC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
