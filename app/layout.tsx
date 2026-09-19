import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { IntroSplash } from '@/components/IntroSplash';

export const metadata: Metadata = {
  title: "Amana — Vos Enfants Entre De Bonnes Mains | Garde & Soutien Scolaire à Alger",
  description: "Plateforme humaine à Alger. 100% Vérification physique au bureau, 0 document sur Internet, 0 DA en ligne (règlement espèces direct), coordination téléphonique humaine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-full flex-col bg-[#FAF8F5] text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
        <AuthProvider>
          <IntroSplash />
          {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
          <Navbar />
          <main className="flex-1 pt-28">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
