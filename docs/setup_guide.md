# Setup Guide - Prescription AI Saathi

## Overview
This guide provides step-by-step instructions for setting up the Prescription AI Saathi development environment, including the latest v1.0.6 updates and requirements.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest version
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### Required Tools
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Android SDK**: API level 24-35
- **Java Development Kit**: Version 11 or higher

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Prescription_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

#### Create Environment File
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_PAYU_MERCHANT_KEY=your_payu_merchant_key
EXPO_PUBLIC_PAYU_SALT=your_payu_salt
```

#### Supabase Configuration
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the `.env` file with your Supabase credentials

#### PayU Configuration
1. Set up a PayU merchant account
2. Configure your merchant key and salt
3. Update the `.env` file with PayU credentials

### 4. Database Setup

#### Run Migrations
```bash
# Navigate to supabase directory
cd supabase

# Apply migrations
supabase db push

# Or run individual migrations
supabase db reset
```

#### Required Migrations
1. `create_quota_tables.sql` - Quota management system
2. `create_coupon_system.sql` - Coupon system
3. `process_prescription_function.sql` - Prescription processing

### 5. Edge Functions Setup

#### Deploy Functions
```bash
# Deploy PayU webhook
supabase functions deploy payu-webhook

# Deploy create-payu-button
supabase functions deploy create-payu-button
```

#### Function Configuration
Update `supabase/config.toml`:
```toml
[functions.payu-webhook]
enabled = true
verify_jwt = false
import_map = "./functions/payu-webhook/deno.json"
entrypoint = "./functions/payu-webhook/index.ts"

[functions.create-payu-button]
verify_jwt = false
```

## Development Environment

### 1. Start Development Server
```bash
# Start Expo development server
npm start

# Or use Expo CLI
expo start
```

### 2. Run on Device/Emulator

#### Android
```bash
# Start Android emulator
npm run android

# Or use development script
./start-pixel8a.ps1  # Windows PowerShell
./start-pixel8a.bat  # Windows Batch
```

#### iOS (macOS only)
```bash
# Start iOS simulator
npm run ios
```

### 3. Development Scripts

#### Available Scripts
```bash
# Development
npm start              # Start development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web

# Testing
npm test              # Run tests
npm run lint          # Run linter

# Build
npm run build         # Custom build script
npm run build:android # Android production build

# Utilities
npm run reset-project # Reset project state
npm run taskmaster    # Run task management
```

#### Development Scripts
- `start-pixel8a.ps1` - Start Pixel 8A emulator (PowerShell)
- `start-pixel8a.bat` - Start Pixel 8A emulator (Batch)
- `rebuild-dev-client.bat` - Rebuild development client
- `build-release-aab.ps1` - Build production AAB
- `build-test-apk.ps1` - Build test APK

### 4. Development Tools

#### VS Code Extensions
- **React Native Tools** - React Native development
- **Expo Tools** - Expo development
- **TypeScript** - TypeScript support
- **ESLint** - Code linting
- **Prettier** - Code formatting

#### Recommended Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Build Configuration

### 1. EAS Build Setup

#### Install EAS CLI
```bash
npm install -g eas-cli
```

#### Login to Expo
```bash
eas login
```

#### Configure Build
The `eas.json` file is already configured with:
- **Development**: Debug builds for testing
- **Preview**: Internal testing builds
- **Production**: Store-ready builds

### 2. Android Build

#### Development Build
```bash
# Create development build
eas build --platform android --profile development

# Or use local build
npm run build:android
```

#### Production Build
```bash
# Create production AAB
eas build --platform android --profile production

# Or use build script
./build-release-aab.ps1
```

### 3. Build Profiles

#### Development Profile
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "android": {
      "gradleCommand": ":app:assembleDebug"
    }
  }
}
```

#### Production Profile
```json
{
  "production": {
    "android": {
      "buildType": "app-bundle",
      "gradleCommand": ":app:bundleRelease"
    },
    "distribution": "store"
  }
}
```

## Testing

### 1. Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watchAll
```

### 2. Component Tests
```bash
# Run specific test file
npm test -- ThemedText-test.tsx
```

### 3. Manual Testing

#### Test Scenarios
1. **Authentication Flow**
   - User registration
   - Email verification
   - Google SSO
   - Password reset

2. **Payment Flow**
   - PayU payment initiation
   - Payment completion
   - Scan quota crediting
   - Transaction verification

3. **Coupon System**
   - WELCOME5 coupon redemption
   - Coupon validation
   - Quota updates

4. **Prescription Processing**
   - Image capture
   - OCR processing
   - Result display
   - Quota deduction

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset cache
npx expo start --reset-cache
```

#### 2. Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npx expo run:android
```

#### 3. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Expo Issues
```bash
# Clear Expo cache
expo r -c

# Reset Expo
expo doctor --fix-dependencies
```

### Development Scripts for Troubleshooting

#### Reset Project
```bash
# Reset project state
npm run reset-project
```

#### Rebuild Development Client
```bash
# Rebuild dev client
./rebuild-dev-client.bat
```

#### Update Templates
```bash
# Update email templates
./update-templates-cli.ps1
```

## Production Deployment

### 1. Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Build configuration verified
- [ ] Version numbers updated

### 2. Build Production App
```bash
# Build production AAB
eas build --platform android --profile production

# Or use build script
./build-release-aab.ps1
```

### 3. Submit to Store
```bash
# Submit to Google Play Store
eas submit --platform android
```

## Version Management

### 1. Version Updates
Update version in:
- `package.json` - App version
- `app.json` - Expo version
- `eas.json` - Build version

### 2. Release Notes
- Update `RELEASE_NOTES_v1.0.2.md`
- Update `TECHNICAL_CHANGELOG_v1.0.2.md`
- Update documentation

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secure environment variable management
- Rotate API keys regularly

### 2. Database Security
- Enable Row Level Security (RLS)
- Use parameterized queries
- Validate all inputs

### 3. Payment Security
- Verify PayU webhook signatures
- Implement transaction deduplication
- Secure payment data handling

## Performance Optimization

### 1. Build Optimization
- Enable Hermes engine
- Optimize bundle size
- Use production builds for testing

### 2. Runtime Optimization
- Implement lazy loading
- Optimize image handling
- Use efficient state management

### 3. Database Optimization
- Use proper indexes
- Optimize queries
- Implement caching strategies

## Support and Resources

### 1. Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)

### 2. Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://reactnative.dev/community)
- [Supabase Community](https://supabase.com/community)

### 3. Issue Reporting
- Use GitHub Issues for bug reports
- Include detailed reproduction steps
- Provide device and OS information

---

*This setup guide reflects the current state of the Prescription AI Saathi application as of v1.0.6. For the most up-to-date information, refer to the latest documentation and codebase.* 