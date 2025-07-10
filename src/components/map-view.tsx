'use client';

import { useState, useEffect } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export function MapView({ mapId }: { mapId?: string }) {
  const [position, setPosition] = useState({ lat: 51.5072, lng: -0.1276 }); // Default to London
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {error && <div className="p-4 text-destructive-foreground bg-destructive">{error}</div>}
      <Map
        center={position}
        zoom={15}
        fullscreenControl={false}
        streetViewControl={false}
        mapTypeControl={false}
        zoomControl={false}
        mapId={mapId}
      >
        <AdvancedMarker position={position} />
      </Map>
    </div>
  );
}
