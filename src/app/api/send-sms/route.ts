import { NextRequest, NextResponse } from 'next/server';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// Initialize SNS client for India region
const sns = new SNSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export async function POST(request: NextRequest) {
    try {
        const { phone, message, location } = await request.json();

        // Validate input
        if (!phone || !message) {
            return NextResponse.json(
                { success: false, error: 'Phone number and message are required' },
                { status: 400 }
            );
        }

        // Format phone number for India (+91)
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

        // Create emergency SMS message with Indian timezone
        const emergencyMessage = `🚨 EMERGENCY SOS ALERT 🚨

${message}

📍 Location: ${location || 'Unknown location'}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

This is an automated emergency alert from SHEILD.
For emergency assistance, contact local authorities immediately.

- SHEILD Emergency System
- This is a transactional message`;

        console.log(`📱 Sending real SMS to ${formattedPhone}:`, emergencyMessage.substring(0, 100) + '...');

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

        console.log(`✅ Real SMS sent successfully to ${formattedPhone}:`, result.MessageId);

        return NextResponse.json({
            success: true,
            messageId: result.MessageId,
            phone: formattedPhone
        });

    } catch (error: any) {
        console.error('❌ Real SMS sending failed:', error);

        // Handle specific AWS errors
        let errorMessage = error.message;
        let shouldFallback = false;

        if (error.name === 'OptOutException') {
            errorMessage = 'Phone number has opted out of SMS';
        } else if (error.name === 'InvalidParameterException') {
            errorMessage = 'Invalid phone number format';
        } else if (error.name === 'ThrottledException') {
            errorMessage = 'SMS rate limit exceeded';
            shouldFallback = true;
        } else if (error.name === 'AuthorizationErrorException') {
            errorMessage = 'AWS credentials are invalid or missing';
        } else if (error.message && error.message.includes('No quota left for account')) {
            errorMessage = 'SMS quota exhausted. Please check AWS SNS spending limits.';
            shouldFallback = true;
        } else if (error.message && error.message.includes('quota')) {
            errorMessage = 'SMS quota limit reached. Please check AWS SNS configuration.';
            shouldFallback = true;
        }

        // If it's a quota issue, return a specific error that the client can handle
        if (shouldFallback) {
            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    quotaExceeded: true,
                    fallbackAvailable: true
                },
                { status: 429 } // Too Many Requests
            );
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
} 