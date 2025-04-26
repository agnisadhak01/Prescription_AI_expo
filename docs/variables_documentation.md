# Variables Documentation

## Authentication Variables

### UserRepository Class
```kotlin
private val TAG = "UserRepository"
private val client = SupabaseClient.client
private val TEST_EMAIL = "test@user.com"
private val TEST_PASSWORD = "test12345"
private val TEST_USER_ID = "test-user-fixed-id-123"
private val validUsers = mutableMapOf<String, String>()
private var appContext: Context? = null
private val PREF_NAME = "registered_users_prefs"
private val KEY_USERS = "registered_users"
private val KEY_CURRENT_USER = "current_user"
```
- Used for user authentication and management
- Includes test credentials and storage keys
- Manages user data persistence

### AuthViewModel Class
```kotlin
private var userRepository = UserRepository()
private var appContext: Context? = null
private val _currentUser = MutableLiveData<User?>()
private val _isLoading = MutableLiveData<Boolean>()
private val _authResult = MutableLiveData<Result<Unit>>()
private val _biometricEnabled = MutableLiveData<Boolean>()
private val failedAttempts = AtomicInteger(0)
private var lastFailedAttempt: Long = 0
private val lockoutDuration = 5.minutes.inWholeMilliseconds
private val maxFailedAttempts = 5
```
- Manages authentication state
- Handles rate limiting and security
- Controls biometric authentication

## UI State Variables

### PrescriptionsActivity
```kotlin
private val CAMERA_REQUEST_CODE = 100
private val PICK_IMAGE_REQUEST_CODE = 101
private lateinit var binding: ActivityPrescriptionsBinding
private lateinit var recyclerView: RecyclerView
private lateinit var prescriptionsAdapter: PrescriptionsAdapter
private val prescriptionsList = ArrayList<PrescriptionModel>()
private val originalPrescriptionsList = ArrayList<PrescriptionModel>()
private lateinit var searchView: SearchView
private lateinit var viewModel: PrescriptionViewModel
private lateinit var noDataTextView: TextView
private lateinit var progressBar: ProgressBar
```
- Manages prescription list UI state
- Handles camera and image picker requests
- Controls search functionality

### LoginActivity
```kotlin
private lateinit var viewModel: AuthViewModel
private lateinit var emailEditText: EditText
private lateinit var passwordEditText: EditText
private lateinit var loginButton: Button
private lateinit var testLoginButton: Button
private lateinit var testConnectionButton: Button
private lateinit var registerText: TextView
private lateinit var progressBar: ProgressBar
private var isFromLogout = false
```
- Manages login screen UI state
- Handles user input and authentication
- Controls test functionality

## Database Variables

### SupabaseClient Object
```kotlin
private const val TAG = "SupabaseClient"
private var _client: SupabaseClient? = null
```
- Manages Supabase client instance
- Handles database connections
- Controls authentication state

## Session Management Variables

### UserSessionManager Object
```kotlin
private const val TAG = "UserSessionManager"
private const val PREF_NAME = "user_session_prefs"
private const val KEY_USER_SESSION = "user_session"
private const val KEY_IS_LOGGED_IN = "is_logged_in"
private const val KEY_USER_ID = "user_id"
private const val KEY_USER_EMAIL = "user_email"
```
- Manages user session persistence
- Controls login state
- Handles user data storage

## Configuration Variables

### AppSecrets Object
```kotlin
const val DATABASE_NAME = "medscan_database"
const val DATABASE_VERSION = 1
const val DATABASE_EXPORT_SCHEMA = false
const val PRESCRIPTION_IMAGES_DIR = "prescription_images"
const val TEMP_SCANS_DIR = "temp_scans"
```
- Defines app configuration
- Controls database settings
- Manages storage paths

## Feature Control Variables

### AppSecrets Object
```kotlin
const val ENABLE_CLOUD_SYNC = true
const val ENABLE_OFFLINE_MODE = true
const val ENABLE_ADVANCED_OCR = true
const val ENABLE_MEDICATION_REMINDERS = true
```
- Controls feature availability
- Manages app behavior
- Enables/disables functionality

## Performance Variables

### AppSecrets Object
```kotlin
const val DEFAULT_SCAN_RESOLUTION = 1080
const val IMAGE_QUALITY_COMPRESSION = 85
const val MAX_STORED_PRESCRIPTIONS = 100
const val AUTO_SYNC_INTERVAL = 6 * 60 * 60 * 1000L
```
- Controls app performance
- Manages resource usage
- Defines sync intervals

## Security Variables

### AuthViewModel Class
```kotlin
private val failedAttempts = AtomicInteger(0)
private var lastFailedAttempt: Long = 0
private val lockoutDuration = 5.minutes.inWholeMilliseconds
private val maxFailedAttempts = 5
```
- Manages security measures
- Controls login attempts
- Handles account lockout

## Error Handling Variables

### UserRepository Class
```kotlin
private val TAG = "UserRepository"
private val ERROR_MESSAGES = mapOf(
    "already exists" to "This email is already registered",
    "network" to "Network error. Please check your connection",
    "invalid" to "Invalid credentials"
)
```
- Manages error messages
- Controls error handling
- Defines user feedback 