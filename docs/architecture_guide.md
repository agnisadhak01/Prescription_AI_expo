# Architecture Guide

## Overview

The app follows Clean Architecture principles with MVVM (Model-View-ViewModel) pattern, using modern Android development practices and Jetpack components.

## Architecture Layers

### 1. Presentation Layer
- **Components**:
  - Activities/Fragments
  - ViewModels
  - UI State
  - Composables
- **Responsibilities**:
  - UI rendering
  - User interaction handling
  - State management
  - Navigation

### 2. Domain Layer
- **Components**:
  - Use Cases
  - Domain Models
  - Repository Interfaces
- **Responsibilities**:
  - Business logic
  - Data transformation
  - Validation rules
  - Error handling

### 3. Data Layer
- **Components**:
  - Repositories
  - Data Sources
  - Data Models
  - API Clients
- **Responsibilities**:
  - Data operations
  - Network calls
  - Local storage
  - Data caching

## Key Components

### 1. Authentication
```kotlin
// Authentication Flow
User -> AuthViewModel -> AuthRepository -> SupabaseClient
```

### 2. Prescription Management
```kotlin
// Prescription Flow
User -> PrescriptionViewModel -> PrescriptionRepository -> SupabaseClient
```

### 3. Image Processing
```kotlin
// Image Processing Flow
User -> CameraViewModel -> ImageProcessor -> StorageRepository
```

## Design Patterns

### 1. Repository Pattern
```kotlin
interface Repository<T> {
    suspend fun get(id: String): Result<T>
    suspend fun getAll(): Result<List<T>>
    suspend fun save(item: T): Result<Unit>
    suspend fun delete(id: String): Result<Unit>
}
```

### 2. Dependency Injection
```kotlin
// Using Hilt
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient {
        return createSupabaseClient(...)
    }
}
```

### 3. State Management
```kotlin
data class UiState<T>(
    val data: T? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)
```

## Data Flow

### 1. Authentication Flow
1. User enters credentials
2. ViewModel validates input
3. Repository makes API call
4. Response handled and state updated
5. UI reflects new state

### 2. Prescription Flow
1. User requests prescriptions
2. ViewModel fetches data
3. Repository checks cache
4. Network call if needed
5. Data transformed and displayed

### 3. Image Processing Flow
1. User captures image
2. Image processed locally
3. Uploaded to storage
4. URL saved to database
5. UI updated with result

## Error Handling

### 1. Network Errors
```kotlin
sealed class NetworkError {
    data class ConnectionError(val message: String) : NetworkError()
    data class ServerError(val code: Int) : NetworkError()
    data class ClientError(val message: String) : NetworkError()
}
```

### 2. Data Validation
```kotlin
sealed class ValidationResult {
    object Valid : ValidationResult()
    data class Invalid(val message: String) : ValidationResult()
}
```

## Testing Strategy

### 1. Unit Tests
- ViewModel tests
- Repository tests
- Use case tests
- Utility function tests

### 2. Integration Tests
- API integration tests
- Database operations tests
- Image processing tests

### 3. UI Tests
- Screen navigation tests
- User interaction tests
- State management tests

## Performance Considerations

### 1. Memory Management
- Use weak references where appropriate
- Clear unused resources
- Implement proper lifecycle handling

### 2. Network Optimization
- Implement caching
- Use pagination
- Optimize image loading

### 3. UI Performance
- Use lazy loading
- Implement view recycling
- Optimize layout hierarchy

## Security Measures

### 1. Data Protection
- Encrypt sensitive data
- Use secure storage
- Implement proper session management

### 2. Network Security
- Use HTTPS
- Implement certificate pinning
- Validate server responses

### 3. Authentication
- Implement proper token management
- Use biometric authentication
- Handle session expiration

## Best Practices

1. **Code Organization**
   - Follow package by feature
   - Use clear naming conventions
   - Document public APIs

2. **Error Handling**
   - Use sealed classes for errors
   - Implement proper logging
   - Provide user-friendly messages

3. **Testing**
   - Write unit tests for business logic
   - Test edge cases
   - Use mock objects appropriately

4. **Performance**
   - Profile app regularly
   - Optimize database queries
   - Use appropriate data structures

5. **Security**
   - Follow security best practices
   - Regular security audits
   - Keep dependencies updated

## Image Processing

### 1. Image Upload Flow
```kotlin
// Image Upload Flow
User -> Camera/Gallery -> ImageProcessor -> StorageRepository -> Database
```

### 2. Components
- **Image Capture**
  - Camera integration
  - Gallery selection
  - Image compression
  - Format conversion

- **Image Processing**
  - OCR processing via n8n webhook
  - Text extraction
  - Data validation
  - Error handling

- **Storage**
  - Supabase storage bucket
  - Local storage fallback
  - Image URL management
  - Cache management

### 3. Security
- Secure image upload
- Access control
- Data encryption
- Privacy protection

### 4. Performance
- Image compression
- Caching strategy
- Background processing
- Error recovery

## Project Structure

The project is organized as follows:

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

``` 