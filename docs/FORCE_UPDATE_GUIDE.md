# Force Update System Guide

## Overview

The Force Update System ensures that users update to the latest version of AI Prescription Saathi by July 28th, 2025. This system prevents app usage for outdated versions and provides a seamless update experience.

## Configuration

### Main Configuration File: `constants/ForceUpdateConfig.ts`

```typescript
export const FORCE_UPDATE_CONFIG: ForceUpdateConfig = {
  // Master switch - set to false to disable force updates completely
  isEnabled: true,
  
  // Force update deadline - July 28th, 2025 at 23:59:59 UTC
  forceUpdateDate: '2025-07-28T23:59:59.999Z',
  
  // Minimum required app version
  minimumVersion: '1.0.6',
  
  // Store URLs
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ausomemgr.prescription',
  appStoreUrl: undefined, // Add iOS App Store URL when available
  
  // User-facing message
  message: 'A critical update is required to continue using AI Prescription Saathi...'
};
```

## How It Works

### 1. **Automatic Check**
- The system checks for updates every time the app starts
- Compares current app version with minimum required version
- Checks if the force update deadline has passed

### 2. **Force Update Triggers**
The app will force an update if:
- **Date-based**: Current date is after July 28th, 2025
- **Version-based**: Current app version is below 1.0.6
- **Master switch**: Force update system is enabled

### 3. **User Experience**
When a force update is triggered:
- App shows a blocking update screen
- Users cannot access any app functionality
- Direct link to Play Store for immediate update
- Option to exit app (though they can't use it)

## Management

### Enabling/Disabling Force Updates

**To disable force updates temporarily:**
```typescript
// In constants/ForceUpdateConfig.ts
export const FORCE_UPDATE_CONFIG: ForceUpdateConfig = {
  isEnabled: false, // Set to false to disable
  // ... other config
};
```

**To enable force updates:**
```typescript
export const FORCE_UPDATE_CONFIG: ForceUpdateConfig = {
  isEnabled: true, // Set to true to enable
  // ... other config
};
```

### Updating the Deadline

**To extend the deadline:**
```typescript
// Change the date to a new deadline
forceUpdateDate: '2025-08-15T23:59:59.999Z', // New deadline
```

**To set immediate force update:**
```typescript
// Set to a past date to trigger immediately
forceUpdateDate: '2025-01-01T00:00:00.000Z', // Immediate trigger
```

### Updating Minimum Version

**To require a newer version:**
```typescript
minimumVersion: '1.0.7', // New minimum version
```

## Implementation Details

### Components

1. **ForceUpdateChecker** (`components/ForceUpdateChecker.tsx`)
   - Main component that checks for updates
   - Shows update screen when needed
   - Handles store navigation

2. **ForceUpdateConfig** (`constants/ForceUpdateConfig.ts`)
   - Centralized configuration
   - Helper functions for version comparison
   - Platform-specific store URL handling

### Integration

The ForceUpdateChecker is integrated in `app/_layout.tsx` and wraps all app content:

```typescript
// For authenticated users
<ForceUpdateChecker>
  <ThemeProvider>
    {/* App content */}
  </ThemeProvider>
</ForceUpdateChecker>

// For non-authenticated users
<ForceUpdateChecker>
  <Stack>
    {/* Auth screens */}
  </Stack>
</ForceUpdateChecker>
```

## Testing

### Testing Force Update

1. **Date-based testing:**
   ```typescript
   // Temporarily set to past date
   forceUpdateDate: '2025-01-01T00:00:00.000Z'
   ```

2. **Version-based testing:**
   ```typescript
   // Set minimum version higher than current
   minimumVersion: '999.0.0'
   ```

3. **Disable for testing:**
   ```typescript
   isEnabled: false
   ```

### Testing Update Flow

1. Trigger force update using above methods
2. Verify update screen appears
3. Test "Update Now" button opens Play Store
4. Test "Exit App" button functionality
5. Verify app is blocked until update

## Monitoring

### Logs

The system logs force update triggers:
```javascript
console.log('Force update triggered:', {
  currentVersion: '1.0.5',
  minimumVersion: '1.0.6',
  forceUpdateDate: '2025-07-28T23:59:59.999Z',
  currentDate: '2025-07-29T10:30:00.000Z',
  isEnabled: true
});
```

### Analytics

Consider adding analytics to track:
- How many users are affected by force updates
- Update completion rates
- User behavior during force update screens

## Security Considerations

1. **Version Validation**: The system validates app versions to prevent bypassing
2. **Date Validation**: Uses server time to prevent date manipulation
3. **Graceful Fallback**: If force update check fails, app continues normally
4. **No Data Loss**: Force updates don't affect user data

## Best Practices

1. **Communicate Early**: Notify users about upcoming force updates
2. **Test Thoroughly**: Test force update system before deployment
3. **Monitor Impact**: Track how force updates affect user engagement
4. **Provide Support**: Have support channels ready for users with issues
5. **Gradual Rollout**: Consider gradual force update implementation

## Troubleshooting

### Common Issues

1. **Force update not triggering:**
   - Check `isEnabled` is set to `true`
   - Verify date format is correct ISO string
   - Ensure version comparison is working

2. **Store URL not opening:**
   - Verify Play Store URL is correct
   - Test on different devices/platforms
   - Check device has Play Store installed

3. **App stuck on update screen:**
   - Check if user has updated app
   - Verify version detection is working
   - Consider clearing app cache

### Emergency Disable

If force updates cause issues, immediately disable:
```typescript
export const FORCE_UPDATE_CONFIG: ForceUpdateConfig = {
  isEnabled: false, // Emergency disable
  // ... rest of config
};
```

## Future Enhancements

1. **Remote Configuration**: Move config to server for dynamic updates
2. **Progressive Updates**: Show warnings before forcing updates
3. **In-App Updates**: Support for in-app update mechanisms
4. **Analytics Integration**: Track update success rates
5. **Multi-Platform Support**: Enhanced iOS App Store integration

---

**Last Updated**: July 25, 2025  
**Version**: 1.0.6  
**Next Review**: August 1, 2025 