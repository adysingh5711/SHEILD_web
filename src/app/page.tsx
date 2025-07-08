'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuardianAngelIcon } from '@/components/icons';

export default function SplashPage() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      setVisible(false);
    }, 2500); // Animation duration + display time

    const navigationTimer = setTimeout(() => {
      router.push('/login');
    }, 3500); // Time for fade out animation

    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background transition-opacity duration-500">
       <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 transition-all duration-1000',
          visible ? 'animate-splash-in' : 'animate-splash-out'
        )}
      >
        <GuardianAngelIcon className="h-24 w-24 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter text-foreground font-headline">
          Guardian Angel
        </h1>
        <p className="text-muted-foreground">Your personal safety companion.</p>
      </div>
    </main>
  );
}
