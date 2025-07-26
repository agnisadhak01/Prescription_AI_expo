# Architecture Guide - Prescription AI Saathi

## Overview
This document provides a comprehensive overview of the Prescription AI Saathi application architecture, including the latest v1.0.2 updates, component structure, and system design.

## System Architecture

### Tech Stack
- **Frontend**: React Native 0.79.5 + Expo 53.0.20
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Language**: TypeScript
- **Navigation**: Expo Router v5.1.4
- **State Management**: React Context API
- **Payment**: PayU Integration
- **Build System**: EAS Build

### Current Version
- **App Version**: 1.0.6 (Build 17)
- **Target SDK**: 35
- **Minimum SDK**: 24
- **Last Updated**: July 25, 2025

## Application Structure

### Directory Organization
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

## Core Components

### 1. Authentication System
**Location**: `components/AuthContext.tsx`

**Features**:
- Global authentication state management
- Scan quota management (`scansRemaining`, `refreshScansRemaining`)
- User session persistence
- Google SSO integration
- Email verification handling

**Key Functions**:
```typescript
// Global quota management
const { scansRemaining, refreshScansRemaining } = useAuth();

// Quota refresh after operations
await refreshScansRemaining();
```

### 2. Notification System
**Location**: `components/NotificationContext.tsx`

**Features**:
- Global notification state management
- Real-time notification updates
- Badge count management
- Notification popup display
- Database integration for persistence

**Components**:
- `NotificationPopup` - In-app notification display
- `NotificationIcon` - Badge-enabled notification icon
- `NotificationService` - Backend notification operations

### 3. Payment Integration
**Location**: `supabase/functions/payu-webhook/`

**Features**:
- PayU payment gateway integration
- Webhook handling for payment confirmations
- Transaction verification and duplicate prevention
- Scan quota crediting after successful payments

**Payment Flow**:
1. User initiates payment in app
2. PayU processes payment
3. Webhook receives confirmation
4. Scan quota updated in database
5. User notified of successful payment

### 4. Coupon System
**Location**: `components/CouponTestComponent.tsx`

**Features**:
- Coupon code redemption
- Welcome bonus system (WELCOME5)
- Coupon validation and tracking
- Integration with scan quota system

**Database Integration**:
- `coupons` table - Coupon definitions
- `coupon_redemptions` table - Usage tracking
- `redeem_coupon()` function - Redemption logic

### 5. Prescription Processing
**Location**: `components/prescriptionService.ts`

**Features**:
- Image capture and processing
- OCR text extraction
- Medication information parsing
- Scan quota validation
- Result storage and retrieval

## Navigation Architecture

### Tab Navigation
**Location**: `app/(tabs)/_layout.tsx`

**Tabs**:
1. **Home** - Main scanning interface
2. **Profile** - User profile and settings
3. **Info** - Legal documents and app information

### Stack Navigation
**Location**: `app/(tabs)/info/_layout.tsx`

**Info Section Pages**:
- Terms of Service
- Privacy Policy
- Medical Disclaimer
- About
- Contact

### Navigation Features
- **Back Button Handling**: Custom back button logic for critical flows
- **Hardware Back Button**: Android hardware back button support
- **WebView Navigation**: Payment flow navigation management
- **Deep Linking**: Support for external links and notifications

## Database Architecture

### Core Tables
1. **`profiles`** - Primary user data and scan quota
2. **`coupons`** - Coupon definitions and management
3. **`payment_transactions`** - Payment history
4. **`notifications`** - User notifications
5. **`prescriptions`** - Prescription records
6. **`medication_images`** - Image storage
7. **`scan_history`** - Activity tracking
8. **`scan_quota_transactions`** - Quota transaction log

### Database Functions
- `redeem_coupon()` - Coupon redemption
- `get_current_user_quota()` - Quota retrieval
- `add_scan_quota()` - Quota management
- `process_prescription()` - Prescription processing

### Security
- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** policies
- **Function-level security** with `SECURITY DEFINER`

## State Management

### Context Providers
1. **AuthContext** - User authentication and quota
2. **NotificationContext** - Notification state
3. **ThemeContext** - App theming

### State Patterns
- **Global State**: User data, notifications, theme
- **Local State**: Form data, UI state
- **Optimistic Updates**: Quota changes, notification reads

## UI/UX Architecture

### Design System
**Location**: `constants/Colors.ts`, `constants/ThemeConfig.ts`

**Features**:
- Theme-aware colors (light/dark mode)
- Consistent spacing and typography
- Platform-specific adaptations
- Accessibility considerations

### Component Library
**Location**: `components/ui/`

**Components**:
- `ThemedText` - Theme-aware text component
- `ThemedView` - Theme-aware view component
- `AppStatusBar` - Status bar management
- `DisclaimerComponent` - Legal disclaimers
- `QuotaBadge` - Scan quota display

### Layout Patterns
- **Safe Area Handling**: Proper safe area insets
- **Status Bar Management**: Consistent status bar appearance
- **Responsive Design**: Adapts to different screen sizes
- **Platform Consistency**: Unified experience across platforms

## Recent v1.0.2 Updates

### Critical Fixes
1. **App Crash Resolution**: Fixed `IndexOutOfBoundsException` on startup
2. **Navigation Stability**: Eliminated view hierarchy conflicts
3. **Status Bar Consistency**: Fixed status bar configuration issues
4. **Back Button Fix**: Info tab back button now returns to Info main page

### Technical Improvements
1. **React Native Screens**: Updated to 4.5.0
2. **Dependency Updates**: Latest stable versions
3. **Build Configuration**: Enhanced Android build settings
4. **Memory Management**: Improved performance and stability

### Code Quality
1. **Simplified Navigation**: Removed complex custom handlers
2. **Consistent StatusBar**: Unified status bar configuration
3. **Clean Architecture**: Removed redundant components
4. **Better Error Handling**: Enhanced error management

## Security Architecture

### Authentication
- **Supabase Auth**: Secure user authentication
- **Google SSO**: OAuth 2.0 integration
- **Email Verification**: Required for full access
- **Session Management**: Secure session handling

### Data Protection
- **Encryption**: Data encrypted at rest and in transit
- **RLS Policies**: Database-level access control
- **Input Validation**: Client and server-side validation
- **Secure Storage**: Sensitive data in secure storage

### Payment Security
- **Webhook Verification**: PayU signature validation
- **Transaction Deduplication**: Prevents double crediting
- **Secure Communication**: HTTPS for all payment flows

## Performance Architecture

### Optimization Strategies
1. **Image Optimization**: Compressed image storage
2. **Lazy Loading**: Components loaded on demand
3. **Caching**: Local data caching for offline support
4. **Bundle Optimization**: Reduced app bundle size

### Monitoring
1. **Error Tracking**: Comprehensive error logging
2. **Performance Metrics**: App performance monitoring
3. **User Analytics**: Usage pattern analysis
4. **Crash Reporting**: Automatic crash reporting

## Development Workflow

### Build System
**Location**: `eas.json`, `app.config.js`

**Build Profiles**:
- **Development**: Debug builds for testing
- **Preview**: Internal testing builds
- **Production**: Store-ready builds

### Development Scripts
**Location**: Project root

**Scripts**:
- `start-pixel8a.ps1` - Android emulator startup
- `rebuild-dev-client.bat` - Development client rebuild
- `build-release-aab.ps1` - Production build
- `update-templates-cli.ps1` - Email template updates

### Testing
1. **Unit Tests**: Component and function testing
2. **Integration Tests**: API and database testing
3. **E2E Tests**: Full user flow testing
4. **Manual Testing**: Device-specific testing

## Deployment Architecture

### Build Pipeline
1. **Source Control**: Git-based version control
2. **CI/CD**: Automated build and deployment
3. **Quality Gates**: Automated testing and validation
4. **Release Management**: Versioned releases

### Distribution
1. **Google Play Store**: Primary distribution channel
2. **Internal Testing**: Beta testing program
3. **Production Releases**: Stable version releases
4. **Rollback Strategy**: Emergency rollback procedures

## Monitoring and Analytics

### System Monitoring
1. **Database Performance**: Query performance tracking
2. **API Response Times**: Backend performance monitoring
3. **Error Rates**: Application error tracking
4. **User Engagement**: Usage analytics

### Health Checks
1. **Database Connectivity**: Connection health monitoring
2. **Payment System**: PayU integration health
3. **Notification System**: Delivery success rates
4. **Scan Processing**: OCR success rates

## Future Architecture Plans

### Planned Enhancements
1. **Offline Support**: Enhanced offline capabilities
2. **Real-time Features**: Live collaboration features
3. **Advanced Analytics**: Detailed usage analytics
4. **Multi-language Support**: Internationalization

### Scalability Considerations
1. **Database Optimization**: Query performance improvements
2. **Caching Strategy**: Advanced caching implementation
3. **Microservices**: Service decomposition
4. **Load Balancing**: Traffic distribution

## Documentation

### Current Documentation
- **API Documentation**: Function and endpoint documentation
- **Database Schema**: Complete schema documentation
- **Setup Guide**: Development environment setup
- **Deployment Guide**: Production deployment procedures

### Maintenance
- **Regular Updates**: Monthly documentation reviews
- **Version Tracking**: Documentation version control
- **Change Log**: Detailed change tracking
- **Migration Guides**: Database migration procedures

## Support and Maintenance

### Support Structure
1. **Technical Support**: Development team support
2. **User Support**: Customer service integration
3. **Bug Reporting**: Automated bug reporting system
4. **Feature Requests**: User feedback collection

### Maintenance Schedule
1. **Weekly**: Performance monitoring and optimization
2. **Monthly**: Security updates and dependency updates
3. **Quarterly**: Major feature releases and updates
4. **Annually**: Architecture review and planning

---

*This architecture guide reflects the current state of the Prescription AI Saathi application as of v1.0.6. For the most up-to-date information, refer to the latest documentation and codebase.* 