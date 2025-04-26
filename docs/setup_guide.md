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
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/aiprescriptionsaathi/app/
│   │   │       ├── api/
│   │   │       ├── models/
│   │   │       ├── repository/
│   │   │       ├── ui/
│   │   │       ├── utils/
│   │   │       └── viewmodel/
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
```

## Development Workflow

1. **Authentication Flow**
   - Implement login/register screens
   - Set up Supabase authentication
   - Handle session management

2. **Prescription Management**
   - Create prescription list screen
   - Implement prescription details view
   - Add prescription creation flow

3. **Image Processing**
   - Set up camera integration
   - Implement image upload
   - Add OCR processing

4. **Data Synchronization**
   - Implement offline support
   - Set up background sync
   - Handle conflict resolution

## Testing

1. **Unit Tests**
   - Test repository classes
   - Test view models
   - Test utility functions

2. **UI Tests**
   - Test screen navigation
   - Test user interactions
   - Test error handling

3. **Integration Tests**
   - Test API integration
   - Test database operations
   - Test image processing

## Deployment

1. **Release Build**
   - Generate signed APK/AAB
   - Configure ProGuard rules
   - Test release build

2. **Play Store**
   - Create store listing
   - Prepare screenshots
   - Submit for review

## Maintenance

1. **Monitoring**
   - Set up crash reporting
   - Monitor performance
   - Track user analytics

2. **Updates**
   - Plan feature updates
   - Schedule maintenance
   - Handle user feedback 