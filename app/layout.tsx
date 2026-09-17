import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TataWafa — Services de Garde d\'Enfants & Soutien Scolaire à Alger',
  description: 'Plateforme de confiance pour trouver des babysitters, nounous et enseignants à Alger. Coordination téléphonique et vérification des pièces en main propre.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
