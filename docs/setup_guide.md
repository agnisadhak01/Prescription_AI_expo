# Setup Guide

## Prerequisites

### Development Environment
- Android Studio (Latest Version)
- JDK 17 or higher
- Android SDK (API 33 or higher)
- Kotlin 1.9.0 or higher
- Gradle 8.0 or higher

### Required Accounts
1. Supabase Account
   - Create a new project
   - Get project URL and anon key
   - Set up database tables

2. Firebase Account (Optional)
   - Create a new project
   - Enable Authentication
   - Set up Firestore Database

3. ML Kit Account (Optional)
   - Set up Google Cloud Project
   - Enable ML Kit API
   - Get API key

## Project Setup

### 1. Create New Project
```bash
# Using Android Studio
1. File -> New -> New Project
2. Select "Empty Activity"
3. Name: "AIPrescriptionSaathi"
4. Package name: "com.aiprescriptionsaathi.app"
5. Language: Kotlin
6. Minimum SDK: API 26 (Android 8.0)
```

### 2. Add Dependencies
Add the following to `app/build.gradle.kts`:
```kotlin
dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.0")
    
    // Supabase
    implementation("io.github.jan-tennert.supabase:postgrest-kt:1.4.7")
    implementation("io.github.jan-tennert.supabase:storage-kt:1.4.7")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:1.4.7")
    
    // Ktor
    implementation("io.ktor:ktor-client-android:2.3.7")
    implementation("io.ktor:ktor-client-core:2.3.7")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
}
```

### 3. Configure Supabase

1. Create Database Tables:
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    doctor_name TEXT,
    patient_name TEXT,
    date DATE,
    medicines JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

2. Set up Row Level Security (RLS):
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own prescriptions"
    ON prescriptions FOR SELECT
    USING (auth.uid() = user_id);
```

### 4. Configure Android Manifest

Add required permissions to `AndroidManifest.xml`:
```xml
<manifest ...>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application ...>
        <!-- Add network security config -->
        <meta-data
            android:name="android.security.network.config"
            android:resource="@xml/network_security_config" />
    </application>
</manifest>
```

### 5. Project Structure
```
app/
  (tabs)/
    info/
      about.tsx
      contact.tsx
      medical-disclaimer.tsx
      privacy-policy.tsx
      terms-of-service.tsx
      index.tsx
      _layout.tsx
    index.tsx
    _layout.tsx
    ProfileScreen.tsx
  screens/
    TermsOfServiceScreen.tsx
    PrivacyPolicyScreen.tsx
    ProcessingResultScreen.tsx
    CameraScreen.tsx
    SubscriptionScreen.tsx
    VerifyOTPScreen.tsx
    PriceChartScreen.tsx
    CreateNewPasswordScreen.tsx
    ResetPasswordScreen.tsx
    ForgotPasswordScreen.tsx
  RegisterScreen.tsx
  LoginScreen.tsx
  ForgotPasswordScreen.tsx
  _layout.tsx
  index.tsx
  (auth)/
  +not-found.tsx
components/
  ui/
  utils/
  [other components]
constants/
hooks/
docs/
Taskmaster/ 