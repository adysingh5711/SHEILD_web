import type { ReactNode } from 'react';
import { GuardianAngelIcon } from '@/components/icons';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Link href="/" aria-label="Back to home">
          <GuardianAngelIcon className="h-16 w-16 text-primary" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tighter text-foreground font-headline">
          Guardian Angel
        </h1>
      </div>
      {children}
    </main>
  );
}
