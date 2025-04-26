# Secrets Documentation

## API Keys and Credentials

### Supabase Configuration
```kotlin
const val SUPABASE_URL = "https://fwvwxzvynfrqjvizcejf.supabase.co"
const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dnd4enZ5bmZycWp2aXpjZWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjcwNjEsImV4cCI6MjA2MTE0MzA2MX0.Sy1QPMdReZm9Q-RndAZBYJa40BVzWp2KCeqssVoMlqs"
```
- Used for Supabase database and authentication
- Stored in `SupabaseClient.kt`
- Project ID: fwvwxzvynfrqjvizcejf
- Role: anon
- Token Expiration: 2061-14-30 14:30:61


### Data Encryption
```kotlin
const val DATA_ENCRYPTION_KEY = "MedScan_Data_Encryption_Key_2023"
const val SHARED_PREFS_ENCRYPTION_KEY = "MedScan_SharedPrefs_Encryption_Key_2023"
```
- Used for encrypting sensitive data
- Stored in `AppSecrets.kt`
- Should be changed in production environment

## API Endpoints

### Base URLs
```kotlin
const val BASE_API_URL = "https://api.yourmedscanservice.com/"
const val MEDICATION_LOOKUP_ENDPOINT = "${BASE_API_URL}medications"
const val USER_PROFILE_ENDPOINT = "${BASE_API_URL}users"
```
- Used for API communication
- Stored in `AppSecrets.kt`
- Should be updated with actual service URLs

## Test Credentials

### Test User
```kotlin
private val TEST_EMAIL = "test@user.com"
private val TEST_PASSWORD = "test12345"
private val TEST_USER_ID = "test-user-fixed-id-123"
```
- Used for testing and development
- Stored in `UserRepository.kt`
- Should be removed or disabled in production

## Security Configuration

### Network Security
```xml
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">home.ausomemgr.com</domain>
    <domain includeSubdomains="true">trzhiwtutfzowvbqldbe.supabase.co</domain>
    <domain includeSubdomains="true">supabase1.ausomemgr.com</domain>
    <domain includeSubdomains="true">ausomemgr.com</domain>
</domain-config>
```
- Defines secure network domains
- Stored in `network_security_config.xml`
- Should be updated with actual production domains

## App Configuration

### Storage Settings
```kotlin
const val DEFAULT_SCAN_RESOLUTION = 1080
const val IMAGE_QUALITY_COMPRESSION = 85
const val MAX_STORED_PRESCRIPTIONS = 100
const val AUTO_SYNC_INTERVAL = 6 * 60 * 60 * 1000L
```
- Defines app storage and performance settings
- Stored in `AppSecrets.kt`
- Can be adjusted based on requirements

### Feature Flags
```kotlin
const val ENABLE_CLOUD_SYNC = true
const val ENABLE_OFFLINE_MODE = true
const val ENABLE_ADVANCED_OCR = true
const val ENABLE_MEDICATION_REMINDERS = true
```
- Controls feature availability
- Stored in `AppSecrets.kt`
- Should be configured based on deployment environment

## API Configuration

### Webhook Settings
```kotlin
const val N8N_WEBHOOK_URL = "https://home.ausomemgr.com/webhook/prescription-ocr"
```
- Webhook URL for prescription OCR processing
- Stored in `ApiClient.kt`
- Should be updated for production environment

### Authentication
```kotlin
private const val USERNAME = "user"
private const val PASSWORD = "user@123"
```
- Basic authentication credentials
- Used for webhook access
- Should be updated for production

## Security Best Practices

1. **API Keys and Credentials**
   - Never commit actual credentials to version control
   - Use environment variables or secure storage
   - Rotate keys regularly

2. **Encryption**
   - Use strong encryption algorithms
   - Store encryption keys securely
   - Implement proper key rotation

3. **Network Security**
   - Use HTTPS for all API calls
   - Implement proper certificate pinning
   - Validate server certificates

4. **Data Storage**
   - Encrypt sensitive data at rest
   - Use secure shared preferences
   - Implement proper data cleanup

5. **Authentication**
   - Implement proper session management
   - Use secure token storage
   - Implement proper logout procedures 