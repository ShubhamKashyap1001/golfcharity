import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Golf Charity — Play. Win. Give.',
  description: 'The subscription platform that turns every golf score into charity impact and monthly prize draws.',
  keywords: ['golf', 'charity', 'subscription', 'prize draw', 'stableford'],
  openGraph: {
    title: 'Golf Charity — Play. Win. Give.',
    description: 'Every subscription, every score, every draw — it all goes towards good.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1C1C1C',
                color: '#fff',
                border: '1px solid #2A2A2A',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#F5A623', secondary: '#000' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}