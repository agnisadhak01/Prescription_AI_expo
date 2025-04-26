# Functions Documentation

## Authentication Functions

### UserRepository Class
- `registerUser(name: String, email: String, password: String)`
  - Registers a new user with name, email, and password
  - Validates input and handles registration process
  - Returns Result<User> with success/failure

- `loginUser(email: String, password: String)`
  - Authenticates user with email and password
  - Handles test user login and regular Supabase login
  - Returns Result<User> with success/failure

- `logoutUser()`
  - Logs out the current user
  - Clears session data and secure storage
  - Returns Result<Unit> with success/failure

- `setSession(accessToken: String, refreshToken: String)`
  - Sets user session using access and refresh tokens
  - Updates current user information
  - Returns Result<User> with success/failure

### AuthViewModel Class
- `registerUser(name: String, email: String, password: String)`
  - Handles user registration with validation
  - Manages loading state and error handling
  - Updates UI state through LiveData

- `loginUser(email: String, password: String)`
  - Manages user login process
  - Handles rate limiting and security checks
  - Updates UI state through LiveData

- `logoutUser()`
  - Manages user logout process
  - Clears session and updates UI state
  - Handles error cases

## Prescription Management Functions

### PrescriptionViewModel Class
- `getAllPrescriptions()`
  - Fetches all prescriptions for current user
  - Updates prescriptions list through LiveData
  - Handles error cases and loading states

- `searchPrescriptions(query: String)`
  - Filters prescriptions based on search query
  - Updates filtered list through LiveData
  - Handles empty results

- `savePrescription(prescription: PrescriptionModel)`
  - Saves new prescription to database
  - Updates prescriptions list
  - Handles error cases

## User Session Management

### UserSessionManager Object
- `saveUserSession(context: Context, user: User)`
  - Saves user session data to SharedPreferences
  - Stores user ID, email, and login state
  - Handles secure storage

- `isLoggedIn(context: Context)`
  - Checks if user is currently logged in
  - Returns boolean indicating login state
  - Uses SharedPreferences for persistence

- `getCurrentUser(context: Context)`
  - Retrieves current user information
  - Returns User object or null
  - Handles session validation

## API Client Functions

### SupabaseClient Object
- `initialize(context: Context, coroutineScope: CoroutineScope)`
  - Initializes Supabase client with credentials
  - Sets up authentication and database connections
  - Handles error cases

- `getClient()`
  - Returns initialized Supabase client instance
  - Throws exception if not initialized
  - Used for database operations

- `signIn(email: String, password: String)`
  - Handles user sign in with Supabase
  - Returns Result<String> with user ID
  - Manages authentication state

## Utility Functions

### AppSecrets Object
- `getEncryptedSharedPreferences(context: Context)`
  - Creates encrypted shared preferences instance
  - Uses MasterKey for encryption
  - Returns EncryptedSharedPreferences

### AuthEvent Class
- `getCurrentTimestamp()`
  - Returns current timestamp in ISO format
  - Used for event logging
  - Handles timezone conversion

## Database Operations

### UserRepository Class
- `loadRegisteredUsers()`
  - Loads registered users from SharedPreferences
  - Initializes with default test users if empty
  - Handles error cases

- `saveRegisteredUsers()`
  - Saves registered users to SharedPreferences
  - Uses JSON serialization
  - Handles error cases

## Error Handling Functions

### UserRepository Class
- `handleAuthError(exception: Exception)`
  - Processes authentication errors
  - Returns appropriate error messages
  - Handles different error types

### AuthViewModel Class
- `setupObservers()`
  - Sets up LiveData observers
  - Handles state changes
  - Manages error states 