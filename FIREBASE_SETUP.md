# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "scholarhunt")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Required Services

### Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" sign-in provider
3. Add your domain to authorized domains if needed

### Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in production mode" or "test mode"
3. Select a location for your database

### Realtime Database

1. Go to "Realtime Database" → "Create Database"
2. Choose security rules (start in test mode for development)

### Storage

1. Go to "Storage" → "Get started"
2. Choose security rules (start in test mode for development)

## Step 3: Get Configuration

1. Go to Project Settings (gear icon) → "General" tab
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>) icon
4. Enter app nickname (e.g., "ScholarHunt Web")
5. Copy the config object values

## Step 4: Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

## Step 5: Restart Development Server

After updating the environment variables:

```bash
npm run dev
```

## Troubleshooting

- **Invalid API Key Error**: Check that all environment variables are correctly set
- **Auth Domain Error**: Ensure your domain is added to authorized domains in Firebase Auth settings
- **Permission Denied**: Update Firestore and Storage security rules for development

## Admin Access

The designated admin emails (set via `NEXT_PUBLIC_ADMIN_EMAILS` environment variable as a comma-separated list) will automatically receive admin privileges upon first login.
