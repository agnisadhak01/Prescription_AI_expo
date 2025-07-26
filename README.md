# Prescription AI Saathi

## Overview
Prescription AI Saathi is a React Native mobile application that helps users digitize and organize their prescription medications using AI-powered OCR technology. The app provides a comprehensive solution for prescription management with features like scan quota management, payment integration, and user notifications.

## 🚀 Recent Release: v1.0.6 (Build 17)

### ✅ Critical Fixes Implemented
- **Force Update System** - Implemented mandatory update system effective July 28th, 2025
- **Fixed App Crashes on Startup** - Resolved `IndexOutOfBoundsException` that was causing app crashes
- **Enhanced Navigation Stability** - Eliminated view hierarchy conflicts and improved navigation flow
- **Status Bar Consistency** - Fixed status bar configuration conflicts across screens
- **Info Tab Back Button** - Fixed back button to properly return to Info main page instead of home screen

### 🔧 Technical Updates
- **React Native Screens**: Updated to 4.5.0 for improved rendering performance
- **Build Configuration**: Enhanced Android build settings for better stability
- **Dependency Management**: Updated key dependencies to resolve compatibility issues

## Features

### Core Functionality
- **Prescription Scanning**: AI-powered OCR to extract medication information from prescription images
- **Scan Quota Management**: Credit-based system for prescription processing
- **Payment Integration**: PayU payment gateway for purchasing scan credits
- **Coupon System**: Promotional codes for free scan credits (WELCOME5)
- **User Notifications**: In-app notification system for important updates
- **Authentication**: Secure user authentication with email verification and Google SSO

### User Experience
- **Intuitive Interface**: Clean, modern UI with theme support (light/dark mode)
- **Offline Support**: Basic offline functionality with data synchronization
- **Real-time Updates**: Live quota updates and notification badges
- **Cross-platform**: Consistent experience across Android and iOS

## Tech Stack

### Frontend
- **React Native**: 0.79.5
- **Expo**: 53.0.20
- **TypeScript**: 5.3.3
- **Expo Router**: 5.1.4 (File-based navigation)
- **React Navigation**: 7.0.14

### Backend
- **Supabase**: PostgreSQL database with real-time features
- **Edge Functions**: Deno-based serverless functions
- **Authentication**: Supabase Auth with Google SSO
- **Storage**: Supabase Storage for image management

### Payment
- **PayU**: Payment gateway integration
- **Webhook Processing**: Secure payment confirmation handling

### Build & Deployment
- **EAS Build**: Expo Application Services
- **Android**: Target SDK 35, Minimum SDK 24
- **Distribution**: Google Play Store ready

## Project Structure

```
Prescription_AI/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication screens
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── info/                 # Info section with legal pages
│   │   └── ProfileScreen.tsx     # User profile management
│   ├── screens/                  # Additional screens
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   ├── utils/                   # Utility components
│   └── [core components]        # Main app components
├── constants/                   # App constants and themes
├── hooks/                       # Custom React hooks
├── supabase/                    # Database and functions
│   ├── functions/               # Edge functions
│   │   ├── payu-webhook/        # PayU payment webhook
│   │   └── create-payu-button/  # PayU button generation
│   ├── migrations/              # Database migrations
│   │   ├── create_coupon_system.sql
│   │   ├── create_quota_tables.sql
│   │   ├── process_prescription_function.sql
│   │   ├── database_cleanup_migration.sql
│   │   ├── test_coupon_backend.sql
│   │   ├── sample_data.sql
│   │   ├── storage_setup.sql
│   │   └── database_setup.sql
│   └── templates/               # Email templates
├── scripts/                     # Development and build scripts
│   ├── *.bat                    # Windows batch scripts
│   ├── *.ps1                    # PowerShell scripts
│   ├── *.sh                     # Shell scripts
│   └── *.js                     # Node.js scripts
├── docs/                        # Project documentation
│   ├── current_implementation_status.md
│   ├── database_schema.md
│   ├── architecture_guide.md
│   ├── functions_documentation.md
│   ├── setup_guide.md
│   ├── payu_integration.md
│   ├── compliance_documentation.md
│   ├── RELEASE_NOTES_v1.0.6.md
│   ├── TECHNICAL_CHANGELOG_v1.0.6.md
│   └── [other documentation files]
├── assets/                      # Static assets
├── android/                     # Android-specific files
├── Taskmaster/                  # Task management system
├── templates/                   # HTML templates
├── keystore-details/           # Android keystore information
├── eas-hooks/                  # EAS build hooks
├── gcloud/                     # Google Cloud configuration
├── flows/                      # Development flows
├── Project_data/               # Project data files
├── dist/                       # Distribution files
├── vsix/                       # VS Code extension files
├── .vscode/                    # VS Code settings
├── .idea/                      # IntelliJ IDEA settings
├── .github/                    # GitHub workflows
├── .cursor/                    # Cursor IDE settings
├── .expo/                      # Expo configuration
├── .git/                       # Git repository
├── node_modules/               # Dependencies
├── Builds/                     # Build outputs
├── README.md                   # Main project README
├── package.json                # Project dependencies
├── app.json                    # Expo configuration
├── app.config.js               # Expo app config
├── eas.json                    # EAS build configuration
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  # Git ignore rules
├── cursor-ai-rules.txt         # Cursor AI rules
├── expo-env.d.ts               # Expo environment types
├── google-services.json        # Google Services configuration
├── GoogleService-Info.plist    # iOS Google Services
├── correct_mcp_config.json     # MCP configuration
├── mcp_config_update.json      # MCP configuration update
├── privacy-policy.html         # Privacy policy
├── delete-account.html         # Account deletion page
├── template-update-instructions.txt
├── update-email-templates-fixed.js
├── update-email-templates.js
├── update-email-templates-test.js
└── package-lock.json           # Dependency lock file
```

## Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Prescription_AI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and PayU credentials

# Start development server
npm start
```

### Development Scripts
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

### Development Scripts
- `scripts/start-pixel8a.ps1` - Start Pixel 8A emulator (PowerShell)
- `scripts/start-pixel8a.bat` - Start Pixel 8A emulator (Batch)
- `scripts/rebuild-dev-client.bat` - Rebuild development client
- `scripts/build-release-aab.ps1` - Build production AAB
- `scripts/build-test-apk.ps1` - Build test APK

## Database Schema

### Core Tables
- **`profiles`** - Primary user data and scan quota (37+ users)
- **`coupons`** - Coupon definitions and management (4 coupons)
- **`payment_transactions`** - Payment history (3+ transactions)
- **`notifications`** - User notifications (30+ notifications)
- **`prescriptions`** - Prescription records (37+ prescriptions)
- **`medication_images`** - Image storage (36+ images)
- **`scan_history`** - Activity tracking (127+ scans)
- **`scan_quota_transactions`** - Quota transaction log (38+ transactions)

### Stale Tables (Candidates for Removal)
- **`payments`** - Unused table, superseded by `payment_transactions`
- **`user_sessions`** - Empty table with no references
- **`users`** - Redundant with `profiles`, needs data migration

## Key Features

### Authentication System
- **Global State Management**: AuthContext for user authentication and quota
- **Email Verification**: Required for full access with bonus scans
- **Google SSO**: OAuth 2.0 integration
- **Session Persistence**: Secure session handling

### Scan Quota Management
- **Global Context**: `useAuth()` hook for quota management
- **Real-time Updates**: Live quota synchronization
- **Payment Integration**: PayU for purchasing scan credits
- **Coupon System**: WELCOME5 coupon for new users

### Payment System
- **PayU Integration**: Secure payment processing
- **Webhook Handling**: Automatic scan crediting after payment
- **Transaction Verification**: Duplicate prevention and fraud protection
- **Payment Plans**: ₹149 (5 scans), ₹999 (15 scans), ₹1999 (35 scans)

### Notification System
- **Global Context**: NotificationContext for state management
- **Real-time Updates**: Live notification synchronization
- **Badge Management**: Unread count display
- **Database Integration**: Persistent notification storage

### Coupon System
- **Active Coupons**: WELCOME5 (5 free scans for new users)
- **Validation**: Expiry, usage limits, and duplicate prevention
- **Integration**: Seamless quota updates after redemption
- **Testing**: CouponTestComponent for validation

## Current System Status

### ✅ Working Components
- **Coupon System**: WELCOME5 tested and functional
- **Authentication**: Email verification and Google SSO working
- **Navigation**: Fixed in v1.0.6, stable navigation flow
- **App Stability**: Crash issues resolved in v1.0.6
- **UI/UX**: Consistent status bar and theme support

### ⚠️ Issues Identified
- **Payment System**: PayU payments may not credit scans due to wrong table usage
- **Database Inconsistency**: Data split between `users` and `profiles` tables
- **Function Updates Needed**: Some functions still reference deprecated tables

### 🗑️ Stale Components
- **`payments` Table**: Empty, unused table
- **`user_sessions` Table**: Empty, no references in code
- **`users` Table**: Redundant with `profiles`, needs migration

## Recent Migrations

### ✅ Completed Migrations
1. **`create_coupon_system.sql`** - Coupon system implementation
2. **`create_quota_tables.sql`** - Quota management system
3. **`process_prescription_function.sql`** - Enhanced prescription processing

### 🔄 Required Migrations
1. **Data Migration**: Migrate `users` data to `profiles`
2. **Function Updates**: Update functions to use `profiles` table
3. **Table Cleanup**: Remove stale tables after verification

## Security Features

### Data Protection
- **Encryption**: Data encrypted at rest and in transit
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **Secure Storage**: Sensitive data in secure storage

### Authentication Security
- **Supabase Auth**: Secure user authentication
- **Email Verification**: Required for full access
- **Session Management**: Secure session handling
- **OAuth Integration**: Google SSO with proper security

### Payment Security
- **Webhook Verification**: PayU signature validation
- **Transaction Deduplication**: Prevents double crediting
- **Secure Communication**: HTTPS for all payment flows

## Force Update System

### Overview
The app includes a mandatory force update system that ensures users update to the latest version by July 28th, 2025. This system prevents app usage for outdated versions and provides a seamless update experience.

### Key Features
- **Automatic Detection**: Checks app version on startup
- **Date-based Enforcement**: Enforces updates after July 28th, 2025
- **Version-based Enforcement**: Requires minimum version 1.0.6
- **Seamless Update Flow**: Direct link to Play Store
- **Graceful Fallback**: App continues if update check fails

### Configuration
- **Master Switch**: Enable/disable force updates via `constants/ForceUpdateConfig.ts`
- **Deadline Management**: Configurable force update date
- **Version Control**: Adjustable minimum required version
- **Store Integration**: Automatic Play Store/App Store detection

### Testing
- **Test Script**: `scripts/test-force-update.js` for validation
- **Configuration Testing**: Verify force update logic
- **User Experience Testing**: Test update flow and messaging

For detailed information, see [`docs/FORCE_UPDATE_GUIDE.md`](docs/FORCE_UPDATE_GUIDE.md).

## Performance Optimization

### Build Optimization
- **Hermes Engine**: Enabled for better performance
- **Bundle Optimization**: Reduced app bundle size
- **Production Builds**: Optimized for release

### Runtime Optimization
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed image storage
- **Caching**: Local data caching for offline support
- **State Management**: Efficient React Context usage

## Testing

### Test Coverage
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **Manual Testing**: Device-specific testing
- **Payment Testing**: PayU integration testing

### Test Scenarios
1. **Authentication Flow**: Registration, login, email verification
2. **Payment Flow**: PayU payment, webhook processing, quota crediting
3. **Coupon System**: WELCOME5 redemption, validation, quota updates
4. **Prescription Processing**: Image capture, OCR, quota deduction

## Deployment

### Build Configuration
- **Development**: Debug builds for testing
- **Preview**: Internal testing builds
- **Production**: Store-ready builds

### Distribution
- **Google Play Store**: Primary distribution channel
- **Internal Testing**: Beta testing program
- **Production Releases**: Stable version releases

## Documentation

### Current Documentation
- **`docs/current_implementation_status.md`** - System status and audit
- **`docs/database_schema.md`** - Complete database documentation
- **`docs/architecture_guide.md`** - System architecture overview
- **`docs/functions_documentation.md`** - Function documentation
- **`docs/setup_guide.md`** - Development setup guide
- **`docs/FORCE_UPDATE_GUIDE.md`** - Force update system guide
- **`docs/RELEASE_NOTES_v1.0.6.md`** - Release notes
- **`docs/TECHNICAL_CHANGELOG_v1.0.6.md`** - Technical changes

### Maintenance
- **Monthly Reviews**: Documentation updates
- **Version Control**: Track all changes
- **Migration Guides**: Database migration procedures

## Support and Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://reactnative.dev/community)
- [Supabase Community](https://supabase.com/community)

### Issue Reporting
- Use GitHub Issues for bug reports
- Include detailed reproduction steps
- Provide device and OS information

## Version Information

- **Current Version**: 1.0.6 (Build 17)
- **React Native**: 0.79.5
- **Expo**: 53.0.20
- **Target SDK**: 35
- **Minimum SDK**: 24
- **Last Updated**: July 25, 2025

## License

This project is proprietary software. All rights reserved.

## Contact

- **Email**: contact@autoomstudio.com
- **Support**: Priority support for critical issues
- **Documentation**: Comprehensive documentation available

---

*This README reflects the current state of the Prescription AI Saathi application as of v1.0.6. For the most up-to-date information, refer to the latest documentation and codebase.*
