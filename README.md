# SHEILD - Smart Holistic Emergency & Intelligent Location Device

A comprehensive emergency response web application with real-time location tracking, SOS functionality, and emergency contact management.

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in your project root with your Firebase and Google Maps configuration.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:9002](http://localhost:9002)**

## 📋 Setup Requirements

### Firebase Setup
- Create a Firebase project
- Enable Authentication and Firestore Database
- Configure Storage for profile pictures
- Deploy security rules (see `SETUP.md`)

### Google Maps Setup
- Create a Google Cloud project
- Enable required APIs (Maps JavaScript, Directions, Geocoding, Places)
- Create and configure API key
- Set up billing (required for Maps API)

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

## 📱 Features

- **Real-time Location Tracking**: Get your current location on the map
- **SOS Emergency System**: Send emergency alerts with custom messages
- **Emergency Contacts**: Manage your emergency contact list
- **Healthcare Information**: Store important medical information
- **Route Planning**: Calculate routes between locations
- **Profile Management**: Update personal information and profile picture
- **Dark/Light Mode**: Toggle between themes

## 🔒 Security

The application includes comprehensive security rules:
- Users can only access their own data
- All Firestore collections are protected by authentication
- Profile pictures are restricted to user's own uploads

## 📖 Documentation

For detailed setup instructions and troubleshooting, see [SETUP.md](./SETUP.md).

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Maps**: Google Maps API with @vis.gl/react-google-maps
- **Forms**: React Hook Form with Zod validation
