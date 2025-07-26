# Google SSO Implementation Guide

## Overview

This guide explains how Google Sign-In (SSO) has been implemented in the Prescription AI app. The integration allows users to sign in with their Google accounts on both the login and registration screens.

## Configuration Files

### 1. Google Cloud Console Setup

The following credentials are configured in the Google Cloud Console:

- **Web Client ID**: `232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Android Debug Client ID**: `232795038046-q65sp6luiitq55sukec7jifn0k01u25g.apps.googleusercontent.com`
- **Android Production Client ID**: `232795038046-ge1cijf049a4bjqu67ek82h44np81dik.apps.googleusercontent.com`

### 2. Native Configuration Files

- **google-services.json**: Android configuration file with both debug and production SHA-1 fingerprints
- **GoogleService-Info.plist**: iOS configuration file with proper bundle ID and client IDs

### 3. App Configuration

- **app.json**: Updated with Google Sign-In plugin and iOS/Android configurations
- **GoogleAuthService.ts**: Service for handling Google authentication
- **AuthContext.tsx**: Context provider with loginWithGoogle implementation

## Implementation Details

### Authentication Flow

1. User clicks the "Sign in with Google" button on Login or Register screen
2. The app shows Google account picker via GoogleSignin.signIn()
3. User selects their Google account
4. App retrieves ID token from Google
5. ID token is sent to Supabase via signInWithIdToken
6. Supabase authenticates the user and returns a session
7. App updates authentication state and navigates to the main app

### Key Components

- **GoogleAuthService.ts**: Core service for Google Sign-In integration
- **AuthContext.tsx**: Global authentication context with Google Sign-In support
- **LoginScreen.tsx**: Login screen with Google Sign-In button
- **RegisterScreen.tsx**: Register screen with Google Sign-In button

## Testing

- Google SSO can only be tested on actual devices or emulators with Google Play Services
- It will not work in Expo Go due to native dependencies
- You must build a development client with EAS to test:

```bash
eas build --profile development --platform android
```

## Troubleshooting Common Issues

### 1. DEVELOPER_ERROR (Error Code 10)

This occurs when there's a mismatch between your app's configuration and Google Cloud Console settings.

**Solutions:**
- Verify that the SHA-1 fingerprints in Google Cloud Console match your app's signing keys
- Make sure the package name is correct
- Check that all required APIs are enabled in Google Cloud Console
- Make sure your OAuth consent screen is properly configured

### 2. No ID Token Present

This happens when Google Sign-In succeeds but doesn't return an ID token.

**Solutions:**
- Use the Web Client ID in `GoogleSignin.configure()`, not an Android client ID
- Make sure your account is added as a test user if the app is in testing mode
- Check that all required scopes (email, profile, openid) are enabled
- Try signing out of Google first, then signing in again

### 3. Authentication Error with Supabase

If Google Sign-In succeeds but Supabase authentication fails:

**Solutions:**
- Verify that Google provider is enabled in Supabase Auth settings
- Check that the client ID and secret are correctly configured in Supabase
- Verify the redirect URL is properly set in Supabase

## SHA-1 Fingerprint Format Issues

- **Google Cloud Console**: Use the format with colons, e.g., `F7:81:0F:9E:16:17:08:7D:43:59:E8:E1:9E:CA:06:D8:CF:09:A7:50`
- **google-services.json**: Use the format without colons, e.g., `F7810F9E1617087D4359E8E19ECA06D8CF09A750`

## Rebuilding After Configuration Changes

Always rebuild your app after making any configuration changes:

```bash
eas build --profile development --platform android
```

For iOS:

```bash
eas build --profile development --platform ios
``` 