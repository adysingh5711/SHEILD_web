'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { MapView } from '@/components/map-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPinOff, Loader2, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/components/auth-provider';
import { useState, useEffect } from 'react';
import {
  createSOSAlert,
  getSOSAlert,
  updateSOSAlertStatus,
  getCurrentLocation,
  sendSMSAlert,
  notifyEmergencyServices,
  notifyIndianEmergencyServices,
  type SOSAlert
} from '@/lib/sos';
import { loadSosSettings } from '@/lib/auth';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SOSAlert | null>(null);
  const [sosSettings, setSosSettings] = useState<{ message: string; contacts: any[] } | null>(null);

  // Load SOS settings and check for active alerts
  useEffect(() => {
    if (!user) return;

    // Load SOS settings
    loadSosSettings(user.uid).then(res => {
      if (res.success && res.data) {
        setSosSettings({
          message: res.data.message || '',
          contacts: res.data.contacts || []
        });
      }
    });

    // Check for active SOS alert
    getSOSAlert(user.uid).then(res => {
      if (res.success && res.alert && res.alert.status === 'active') {
        setCurrentAlert(res.alert);
        setIsSOSActive(true);
      }
    });
  }, [user]);

  const handleSOS = async () => {
    if (!user || !sosSettings) {
      toast({
        title: "SOS Setup Required",
        description: "Please configure your SOS settings first.",
        variant: "destructive"
      });
      return;
    }

    setSosLoading(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Create SOS alert
      const alertResult = await createSOSAlert({
        userId: user.uid,
        userName: user.name,
        userPhone: undefined,
        location,
        message: sosSettings.message || 'Emergency SOS alert activated',
        contacts: sosSettings.contacts.map(contact => ({
          name: contact.name,
          phone: contact.phone,
          notified: false
        }))
      });

      if (!alertResult.success) {
        throw new Error(alertResult.error);
      }

      setCurrentAlert({
        userId: user.uid,
        userName: user.name,
        userPhone: undefined,
        location,
        message: sosSettings.message || 'Emergency SOS alert activated',
        timestamp: new Date(),
        status: 'active',
        contacts: sosSettings.contacts.map(contact => ({
          name: contact.name,
          phone: contact.phone,
          notified: false
        }))
      });
      setIsSOSActive(true);

      // Send SMS alerts to contacts
      const smsResults = await sendSMSAlert(
        sosSettings.contacts,
        sosSettings.message || 'Emergency SOS alert activated',
        location.address || `${location.lat}, ${location.lng}`
      );

      // Notify Indian emergency services
      const emergencyResult = await notifyIndianEmergencyServices(location, {
        name: user.name,
        phone: undefined
      });

      // Show results
      const successfulSMS = smsResults.filter(r => r.success).length;
      const totalSMS = smsResults.length;

      toast({
        title: "SOS Alert Activated!",
        description: `Emergency services notified. ${successfulSMS}/${totalSMS} contacts alerted.`,
        variant: "destructive"
      });

      if (emergencyResult.success && 'dispatchId' in emergencyResult) {
        toast({
          title: "Emergency Services Dispatched",
          description: `Dispatch ID: ${emergencyResult.dispatchId}`,
        });
      }

    } catch (error: any) {
      toast({
        title: "SOS Alert Failed",
        description: error.message || "Failed to activate SOS alert",
        variant: "destructive"
      });
    } finally {
      setSosLoading(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!user || !currentAlert) return;

    setSosLoading(true);

    try {
      await updateSOSAlertStatus(user.uid, 'cancelled');
      setCurrentAlert(null);
      setIsSOSActive(false);

      toast({
        title: "SOS Alert Cancelled",
        description: "Emergency alert has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Cancel SOS",
        description: error.message || "Failed to cancel SOS alert",
        variant: "destructive"
      });
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="flex gap-2">
          {isSOSActive ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancelSOS}
              disabled={sosLoading}
              className="gap-2 shadow-md"
            >
              {sosLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              <span className="font-bold">Cancel SOS</span>
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={handleSOS}
              disabled={sosLoading}
              className="gap-2 shadow-md active:shadow-inner"
            >
              {sosLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-bold">SOS</span>
            </Button>
          )}
        </div>
      </div>

      {isSOSActive && currentAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Emergency SOS Active</AlertTitle>
          <AlertDescription>
            Emergency services have been notified. Your location: {currentAlert.location.address || `${currentAlert.location.lat.toFixed(4)}, ${currentAlert.location.lng.toFixed(4)}`}
          </AlertDescription>
        </Alert>
      )}
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
