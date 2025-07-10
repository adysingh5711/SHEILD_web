'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { MapView } from '@/components/map-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPinOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const { toast } = useToast();
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

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
        <Button variant="destructive" size="lg" onClick={handleSOS} className="gap-2 shadow-md active:shadow-inner">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-bold">SOS</span>
        </Button>
      </div>
      <div className="flex-1 rounded-lg shadow-md border overflow-hidden">
        {mapsApiKey ? (
          <APIProvider apiKey={mapsApiKey}>
            <MapView mapId={mapId} />
          </APIProvider>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-center">
            <MapPinOff className="h-16 w-16 text-muted-foreground mb-4" />
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Map Configuration Error</AlertTitle>
              <AlertDescription>
                The Google Maps API key is missing. Please add your key to the <strong>.env</strong> file to display the map.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
