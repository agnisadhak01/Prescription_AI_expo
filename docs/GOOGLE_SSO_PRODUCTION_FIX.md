# Google SSO Production Fix - Play Store Build Issue

## ✅ CONFIGURATION COMPLETED

**Status**: Production OAuth client has been successfully added to the app configuration.

## Production Configuration Details

- **Production OAuth Client ID**: `232795038046-7qgrkcmmsfupi68r4bamkec01r4rfsoe.apps.googleusercontent.com`
- **Production SHA-1**: `8F:0F:16:03:35:E1:EA:51:29:6F:64:FF:FE:8F:4B:24:C9:5D:64:5F`
- **Package**: `com.ausomemgr.prescription`

## What Has Been Updated

✅ **google-services.json**: Added production OAuth client with production SHA-1 fingerprint  
✅ **app.json**: Added production certificate hash to Android configuration  
✅ **Debug Tools**: Updated with production configuration information  

## Current OAuth Client Configuration

| Type | Client ID | SHA-1 Fingerprint |
|------|-----------|-------------------|
| Development | `232795038046-h8ti1bbf9dm30t2pvpt4sfur3pss2k5p.apps.googleusercontent.com` | `ABF15BE5666196500666777FE27CD0709366A01CD` |
| Production | `232795038046-7qgrkcmmsfupi68r4bamkec01r4rfsoe.apps.googleusercontent.com` | `8F0F160335E1EA51296F64FFFE8F4B24C95D645F` |
| Web Client | `232795038046-rld1dn9s7ocnt93ouec71s27p9ir4pco.apps.googleusercontent.com` | N/A |

## Next Steps

1. **Build and Test**:
   ```bash
   npx eas build --platform android --profile production
   ```

2. **Upload to Play Store**: Upload the new build to Play Store (Internal Testing first)

3. **Test Google SSO**: Download the Play Store build and test Google SSO functionality

## Problem (Original Issue)
Google SSO fails in the Play Store build because the app is signed with a different certificate than the one registered in Google Cloud Console. The app closes after SSO login and returns to the login screen.

## Root Cause
When you publish to the Play Store, your app gets signed with either:
1. Google Play App Signing certificate (if you're using Google Play App Signing)
2. Your production keystore certificate

This creates a different SHA-1 fingerprint than your development build, causing Google to reject the authentication.

## Solution Summary

The solution involved adding the production OAuth client configuration to support both development and production builds:

1. ✅ **Retrieved production SHA-1** from Google Play Console
2. ✅ **Created production OAuth client** in Google Cloud Console
3. ✅ **Updated google-services.json** to include production configuration
4. ✅ **Updated app.json** with production certificate hash

## Testing

To test the fix:

1. **Build production version**:
   ```bash
   npx eas build --platform android --profile production
   ```

2. **Install from Play Store** (or Internal Testing)

3. **Test Google SSO login** - it should now work correctly

## Troubleshooting

If Google SSO still fails in the production build:

1. **Check the exact SHA-1 format**: Ensure it matches exactly what's in Google Play Console
2. **Verify package name**: Must be exactly `com.ausomemgr.prescription`
3. **Check OAuth client configuration**: Ensure the production SHA-1 is correctly added
4. **Clear app data**: Uninstall and reinstall the app to clear any cached authentication state

## Debug Tools

If you need to debug further, use the `GoogleSSODebugComponent` temporarily:

```tsx
import { GoogleSSODebugComponent } from '../components/GoogleSSODebugComponent';

// Add to your LoginScreen temporarily:
<GoogleSSODebugComponent />
```

This will provide detailed diagnostics and help identify any remaining issues.

## Production Build Certificate Information

Your production build uses:
- **Google Play App Signing**: Yes
- **Production SHA-1**: `8F:0F:16:03:35:E1:EA:51:29:6F:64:FF:FE:8F:4B:24:C9:5D:64:5F`
- **OAuth Client**: `232795038046-7qgrkcmmsfupi68r4bamkec01r4rfsoe.apps.googleusercontent.com`

This configuration should resolve the Google SSO authentication issue in your Play Store builds. 