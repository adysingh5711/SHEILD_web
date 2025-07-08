'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { MapView } from '@/components/map-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();

  const handleSOS = () => {
    toast({
      title: "SOS Activated!",
      description: "Your emergency contacts and message have been sent.",
      variant: "destructive"
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <Button variant="destructive" size="lg" onClick={handleSOS} className="gap-2 shadow-neumorphic active:shadow-neumorphic-inset">
          <AlertTriangle className="h-5 w-5"/>
          <span className="font-bold">SOS</span>
        </Button>
      </div>
      <div className="flex-1 rounded-lg shadow-neumorphic overflow-hidden">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <MapView />
        </APIProvider>
      </div>
    </div>
  );
}
