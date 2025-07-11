'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Navigation, MapPin, Route, Plus, Minus, Loader2 } from 'lucide-react';

interface Position {
  lat: number;
  lng: number;
}

interface RouteInfo {
  origin: string;
  destination: string;
  distance?: string;
  duration?: string;
}

export function MapView({ mapId }: { mapId?: string }) {
  const [position, setPosition] = useState<Position>({ lat: 25.2486, lng: 83.1944 }); // Default to Lauda
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    origin: '',
    destination: ''
  });
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [zoom, setZoom] = useState(17);
  const mapRef = useRef<google.maps.Map | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPosition);
        setError(null);
        setIsLocating(false);
      },
      (err) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = `Location error: ${err.message}`;
        }
        setError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const calculateRoute = useCallback(async () => {
    if (!routeInfo.origin || !routeInfo.destination) {
      setError('Please enter both origin and destination.');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Use Google Maps Directions API via fetch
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(routeInfo.origin)}&destination=${encodeURIComponent(routeInfo.destination)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        setRouteInfo(prev => ({
          ...prev,
          distance: leg.distance?.text,
          duration: leg.duration?.text
        }));
        setError(null);
      } else {
        setError(`Unable to calculate route: ${data.status}. Please check your addresses and API key.`);
        setRouteInfo(prev => ({ ...prev, distance: undefined, duration: undefined }));
      }
    } catch (err) {
      setError('Failed to calculate route. Please check your API key and try again.');
      setRouteInfo(prev => ({ ...prev, distance: undefined, duration: undefined }));
    } finally {
      setIsCalculating(false);
    }
  }, [routeInfo.origin, routeInfo.destination]);

  const clearRoute = useCallback(() => {
    setRouteInfo({ origin: '', destination: '' });
    setError(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const newZoom = Math.min(zoom + 1, 20);
      setZoom(newZoom);
      mapRef.current.setZoom(newZoom);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const newZoom = Math.max(zoom - 1, 1);
      setZoom(newZoom);
      mapRef.current.setZoom(newZoom);
    }
  }, [zoom]);

  const onMapLoad = useCallback((event: any) => {
    mapRef.current = event.detail.map;
  }, []);

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 p-3 text-destructive-foreground bg-destructive rounded-md shadow-lg">
          {error}
        </div>
      )}

      {/* Custom Zoom Controls - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1">
        <Button
          onClick={handleZoomIn}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <Button
          onClick={getCurrentLocation}
          size="sm"
          className="bg-primary hover:bg-primary/90 w-full"
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          {isLocating ? 'Locating...' : 'Locate Me'}
        </Button>

        <Button
          onClick={() => setShowRouteForm(!showRouteForm)}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showRouteForm ? 'Hide Route' : 'Show Route'}
        </Button>
      </div>

      {/* Route Form */}
      {showRouteForm && (
        <Card className="absolute top-16 left-4 z-10 w-80 bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Route className="h-4 w-4 mr-2" />
              Route Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="From (origin)"
                value={routeInfo.origin}
                onChange={(e) => setRouteInfo(prev => ({ ...prev, origin: e.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="To (destination)"
                value={routeInfo.destination}
                onChange={(e) => setRouteInfo(prev => ({ ...prev, destination: e.target.value }))}
                className="text-sm"
              />
            </div>

            {(routeInfo.distance || routeInfo.duration) && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <div className="font-medium">Route Information:</div>
                {routeInfo.distance && <div>Distance: {routeInfo.distance}</div>}
                {routeInfo.duration && <div>Duration: {routeInfo.duration}</div>}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={calculateRoute}
                size="sm"
                className="flex-1"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isCalculating ? 'Calculating...' : 'Get Route'}
              </Button>
              <Button onClick={clearRoute} size="sm" variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Map
        center={position}
        zoom={zoom}
        fullscreenControl={true}
        streetViewControl={true}
        mapTypeControl={true}
        zoomControl={false} // Disable default zoom control since we have custom ones
        gestureHandling="auto"
        mapId={mapId}
        className="h-full w-full"
      >
        <AdvancedMarker position={position} />
      </Map>
    </div>
  );
}
