import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SOSAlert {
    userId: string;
    userName: string;
    userPhone?: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    message: string;
    timestamp: Date;
    status: 'active' | 'resolved' | 'cancelled';
    contacts: Array<{
        name: string;
        phone: string;
        notified: boolean;
        notifiedAt?: Date;
    }>;
}

export interface SOSContact {
    name: string;
    phone: string;
    email?: string;
}

// Save SOS alert to Firestore
export async function createSOSAlert(alert: Omit<SOSAlert, 'timestamp' | 'status'>) {
    try {
        const alertData: SOSAlert = {
            ...alert,
            timestamp: new Date(),
            status: 'active'
        };

        await setDoc(doc(db, 'sosAlerts', alert.userId), alertData);
        return { success: true, alertId: alert.userId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get SOS alert by user ID
export async function getSOSAlert(userId: string) {
    try {
        const docSnap = await getDoc(doc(db, 'sosAlerts', userId));
        if (docSnap.exists()) {
            return { success: true, alert: docSnap.data() as SOSAlert };
        } else {
            return { success: true, alert: null };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Update SOS alert status
export async function updateSOSAlertStatus(userId: string, status: SOSAlert['status']) {
    try {
        await setDoc(doc(db, 'sosAlerts', userId), { status }, { merge: true });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Send SMS alert to contacts (requires SMS service integration)
export async function sendSMSAlert(contacts: SOSContact[], message: string, location: string) {
    // This would integrate with services like:
    // - Twilio for SMS
    // - SendGrid for email
    // - Emergency services APIs

    const results = [];

    for (const contact of contacts) {
        try {
            // Example SMS integration (requires actual SMS service)
            const smsResult = await sendSMS(contact.phone, message, location);
            results.push({
                contact,
                success: smsResult.success,
                error: smsResult.error
            });
        } catch (error: any) {
            results.push({
                contact,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}

// AWS SNS SMS function for India
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// Initialize SNS client for India region
const sns = new SNSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

async function sendSMS(phone: string, message: string, location: string) {
    try {
        // Format phone number for India (+91)
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

        // Create emergency SMS message with Indian timezone
        const emergencyMessage = `🚨 EMERGENCY SOS ALERT 🚨

${message}

📍 Location: ${location}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

This is an automated emergency alert from SHEILD.
For emergency assistance, contact local authorities immediately.

- SHEILD Emergency System
- This is a transactional message`;

        const command = new PublishCommand({
            Message: emergencyMessage,
            PhoneNumber: formattedPhone,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                },
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: process.env.AWS_SNS_SENDER_ID || 'SHEILD'
                }
            }
        });

        const result = await sns.send(command);

        console.log(`SMS sent successfully to ${formattedPhone}:`, result.MessageId);

        return {
            success: true,
            messageId: result.MessageId,
            phone: formattedPhone
        };
    } catch (error: any) {
        console.error('SMS sending failed:', error);

        // Handle specific AWS errors
        if (error.name === 'OptOutException') {
            return {
                success: false,
                error: 'Phone number has opted out of SMS'
            };
        } else if (error.name === 'InvalidParameterException') {
            return {
                success: false,
                error: 'Invalid phone number format'
            };
        } else if (error.name === 'ThrottledException') {
            return {
                success: false,
                error: 'SMS rate limit exceeded'
            };
        }

        return {
            success: false,
            error: error.message || 'SMS service unavailable'
        };
    }
}

// Get current location
export async function getCurrentLocation(): Promise<{ lat: number; lng: number; address?: string }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;

                try {
                    // Get address from coordinates using Google Geocoding API
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                    );
                    const data = await response.json();

                    const address = data.results?.[0]?.formatted_address;
                    resolve({ lat, lng, address });
                } catch (error) {
                    // Return coordinates even if address lookup fails
                    resolve({ lat, lng });
                }
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Emergency services integration (mock)
export async function notifyEmergencyServices(location: { lat: number; lng: number; address?: string }, userInfo: { name: string; phone?: string }) {
    // This would integrate with:
    // - 911 emergency services APIs
    // - Local emergency dispatch systems
    // - Emergency response coordination services

    console.log(`Emergency services would be notified for ${userInfo.name} at ${location.address || `${location.lat}, ${location.lng}`}`);

    // Simulate emergency services notification
    return new Promise<{ success: boolean; error?: string; dispatchId?: string }>((resolve) => {
        setTimeout(() => {
            const success = Math.random() > 0.05; // 95% success rate
            resolve({
                success,
                error: success ? undefined : 'Emergency services unavailable',
                dispatchId: success ? `ES-${Date.now()}` : undefined
            });
        }, 2000);
    });
}

// India emergency services integration
export async function notifyIndianEmergencyServices(
    location: { lat: number; lng: number; address?: string },
    userInfo: { name: string; phone?: string }
) {
    try {
        // Create emergency alert for Indian emergency services
        const emergencyData = {
            emergency_type: 'medical',
            location: {
                latitude: location.lat,
                longitude: location.lng,
                address: location.address,
                city: 'Mumbai', // Extract from address
                state: 'Maharashtra' // Extract from address
            },
            caller: {
                name: userInfo.name,
                phone: userInfo.phone || 'Unknown',
                language: 'en' // or 'hi' for Hindi
            },
            timestamp: new Date().toISOString(),
            priority: 'high',
            source: 'SHEILD_APP'
        };

        // For now, log the emergency data
        // In production, this would integrate with:
        // - Local emergency services APIs
        // - Police control room APIs
        // - Ambulance services APIs

        console.log('Emergency services would be notified:', emergencyData);

        // Simulate emergency services response
        return new Promise<{ success: boolean; error?: string; dispatchId?: string }>((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.05; // 95% success rate
                resolve({
                    success,
                    error: success ? undefined : 'Emergency services unavailable',
                    dispatchId: success ? `IN-ES-${Date.now()}` : undefined
                });
            }, 2000);
        });

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to notify emergency services'
        };
    }
} 