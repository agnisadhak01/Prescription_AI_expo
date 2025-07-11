# Architecture Guide

**Last Updated**: December 2024  
**Tech Stack**: React Native + Expo + TypeScript + Supabase  
**Architecture Pattern**: Component-Based with Context API + Edge Functions

## Overview

The Prescription AI app follows modern React Native architecture principles with a **component-based, context-driven design**. The app uses **Supabase** as a Backend-as-a-Service (BaaS) for authentication, database, real-time subscriptions, and serverless functions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React Native)                    │
├─────────────────────────────────────────────────────────────┤
│  UI Layer          │  State Layer      │  Service Layer     │
│  - Screens         │  - Contexts       │  - Supabase Client │
│  - Components      │  - Hooks          │  - API Services    │
│  - Navigation      │  - Local State    │  - Storage         │
├─────────────────────────────────────────────────────────────┤
│                    SUPABASE (Backend)                       │
├─────────────────────────────────────────────────────────────┤
│  Database Layer    │  Function Layer   │  Auth Layer        │
│  - PostgreSQL      │  - RPC Functions  │  - Auth Service    │
│  - Real-time       │  - Edge Functions │  - Row Level Sec.  │
│  - Storage         │  - Webhooks       │  - JWT Tokens      │
└─────────────────────────────────────────────────────────────┘
```

---

## **REACT NATIVE CLIENT ARCHITECTURE**

### **1. UI Layer**

#### **File-Based Routing (Expo Router)**
The app uses Expo Router with file-based routing for navigation:

```
app/
├── _layout.tsx                 # Root layout with auth logic
├── index.tsx                   # Home/Dashboard screen  
├── (auth)/                     # Auth screens group
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── (tabs)/                     # Tab navigation group
│   ├── _layout.tsx            # Tab layout configuration
│   ├── index.tsx              # Home tab
│   ├── ProfileScreen.tsx      # Profile tab
│   └── info/                  # Info tab with child pages
│       ├── _layout.tsx        # Stack navigation for info
│       ├── index.tsx          # Info main page
│       ├── terms-of-service.tsx
│       ├── privacy-policy.tsx
│       └── medical-disclaimer.tsx
└── screens/                   # Additional screens
    ├── CameraScreen.tsx
    ├── SubscriptionScreen.tsx
    ├── ProcessingResultScreen.tsx
    └── VerifyOTPScreen.tsx
```

#### **Component Hierarchy**
```typescript
// Component structure
App
├── AuthContextProvider           // Global auth state
│   ├── NotificationContextProvider  // Global notifications
│   │   ├── RootLayoutStack      // Navigation layout
│   │   │   ├── AuthScreens      // Login/Register
│   │   │   └── TabNavigation    // Main app tabs
│   │   │       ├── HomeTab      // Dashboard with scan quota
│   │   │       ├── ProfileTab   // User profile & settings
│   │   │       └── InfoTab      // Legal docs & info
│   │   └── ModalScreens         // Camera, subscription
```

#### **Key UI Components**

##### **Themed Components** (`components/ThemedText.tsx`, `ThemedView.tsx`)
```typescript
// Automatic light/dark theme support
export function ThemedText({ style, lightColor, darkColor, ...props }: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  return <Text style={[{ color }, style]} {...props} />;
}
```

##### **Status Bar Management** (`components/ui/AppStatusBar.tsx`)
```typescript
// Platform-specific status bar handling
export function AppStatusBar() {
  const colorScheme = useColorScheme();
  return (
    <StatusBar
      backgroundColor={colorScheme === 'dark' ? '#000' : '#fff'}
      barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
}
```

##### **Reusable UI Components**
- `QuotaBadge.tsx` - Scan quota display with real-time updates
- `NotificationIcon.tsx` - Bell icon with unread count badge
- `NotificationPopup.tsx` - Dismissible notification overlay
- `VerificationPrompt.tsx` - Email verification reminder
- `ScanInstructions.tsx` - Prescription scanning guidance

---

### **2. State Management Layer**

#### **Global Context Architecture**

The app uses React Context API for global state management with three main contexts:

##### **AuthContext** (`components/AuthContext.tsx`)
**Purpose**: Manages authentication state and scan quota globally

```typescript
interface AuthContextType {
  // Authentication State
  isAuthenticated: boolean;
  user: any;
  isEmailVerified: boolean;
  loading: boolean;
  
  // Scan Quota State  
  scansRemaining: number | null;
  refreshScansRemaining: () => Promise<void>;
  
  // Authentication Methods
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<{ error?: string }>;
}
```

**Key Responsibilities**:
- Session persistence with AsyncStorage
- Scan quota synchronization with database
- Google OAuth integration
- Real-time auth state updates

##### **NotificationContext** (`components/NotificationContext.tsx`)
**Purpose**: Manages notification state across the app

```typescript
interface NotificationContextType {
  // Notification State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  
  // Notification Methods
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}
```

**Key Features**:
- Real-time notification updates via Supabase subscriptions
- Optimistic UI updates for read status
- Badge count management for tab icons
- Local caching with server synchronization

##### **Theme Context** (Built-in Expo)
**Purpose**: Automatic light/dark theme management

```typescript
// Automatic theme detection and switching
const colorScheme = useColorScheme(); // 'light' | 'dark'
const themeColors = Colors[colorScheme ?? 'light'];
```

#### **Local State Patterns**

##### **Loading States**
```typescript
// Standard loading pattern
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await performAction();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

##### **Optimistic Updates**
```typescript
// Scan quota optimistic updates
const [optimisticScans, setOptimisticScans] = useState<number | null>(null);

const displayScans = optimisticScans ?? scansRemaining;

const useScan = async () => {
  // Optimistic update
  setOptimisticScans(prev => Math.max(0, (prev ?? scansRemaining ?? 0) - 1));
  
  // Server call
  const success = await supabase.rpc('process_prescription', { user_id });
  
  // Refresh from server
  await refreshScansRemaining();
  setOptimisticScans(null);
};
```

---

### **3. Service Layer**

#### **Supabase Client** (`components/supabaseClient.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**Key Features**:
- Persistent sessions across app restarts
- Automatic token refresh
- AsyncStorage integration for React Native

#### **Service Modules**

##### **Authentication Service** (`components/GoogleAuthService.ts`)
```typescript
// Google OAuth integration
export const loginWithGoogle = async () => {
  try {
    await GoogleSignIn.hasPlayServices();
    const { idToken } = await GoogleSignIn.signIn();
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    
    return { data, error };
  } catch (error) {
    return { error: error.message };
  }
};
```

##### **Prescription Service** (`components/prescriptionService.ts`)
```typescript
// OCR and prescription processing
export const processPrescriptionImage = async (imageUri: string, userId: string) => {
  // 1. Validate scan quota
  const { data: hasQuota } = await supabase.rpc('process_prescription', { user_id: userId });
  if (!hasQuota) throw new Error('No scans remaining');
  
  // 2. Upload image to Supabase Storage
  const fileName = `prescription_${Date.now()}.jpg`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('prescription-images')
    .upload(fileName, imageFile);
  
  // 3. Process with OCR service
  const ocrResult = await performOCR(imageUri);
  
  // 4. Save to database
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      user_id: userId,
      image_url: uploadData.path,
      extracted_text: ocrResult.text,
      medications: ocrResult.medications
    });
  
  return { data, error };
};
```

##### **Notification Service** (`components/NotificationService.ts`)
```typescript
// Push notification handling
export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Save token to user profile
  await supabase
    .from('profiles')
    .update({ push_token: token.data })
    .eq('id', user.id);
};
```

##### **Storage Service** (`components/storageService.ts`)
```typescript
// Local storage utilities
export const storageService = {
  async storeSecurely(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  },
  
  async getSecurely(key: string) {
    return await SecureStore.getItemAsync(key);
  },
  
  async removeSecurely(key: string) {
    await SecureStore.deleteItemAsync(key);
  }
};
```

---

## **SUPABASE BACKEND ARCHITECTURE**

### **Database Layer**

#### **Table Design**
```sql
-- Core tables with relationships
profiles (id, email, full_name, scans_remaining, created_at)
├── prescriptions (id, user_id, image_url, extracted_text)
│   └── prescription_images (id, prescription_id, image_url, ocr_data)
├── notifications (id, user_id, title, message, is_read)
├── payment_transactions (id, user_id, amount, scans_added, status)
├── scan_quota_transactions (id, user_id, amount, transaction_type)
└── coupons (id, code, scans_amount, max_redemptions, expires_at)
```

#### **Row Level Security (RLS)**
```sql
-- Secure data access patterns
CREATE POLICY "Users can only see own data" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access own prescriptions" ON prescriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

#### **Real-time Subscriptions**
```typescript
// Listen for quota changes
useEffect(() => {
  if (!user) return;
  
  const channel = supabase
    .channel('profile-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${user.id}`
    }, (payload) => {
      setScansRemaining(payload.new.scans_remaining);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [user]);
```

### **Function Layer**

#### **RPC Functions** (PostgreSQL)
Server-side functions called from client:

```typescript
// Client calls
await supabase.rpc('get_current_user_quota');           // Get scan count
await supabase.rpc('process_prescription', { user_id }); // Deduct scan
await supabase.rpc('redeem_coupon', { user_id, coupon_code }); // Apply coupon
await supabase.rpc('get_user_notifications', { include_read: false });
```

#### **Edge Functions** (Deno/TypeScript)
Serverless functions for external integrations:

##### **PayU Webhook** (`supabase/functions/payu-webhook/index.ts`)
```typescript
// Process payment notifications
Deno.serve(async (req: Request) => {
  const formData = await req.formData();
  const amount = formData.get('amount');
  const email = formData.get('email');
  const txnid = formData.get('txnid');
  
  // Determine scan quota based on amount
  const scanQuota = SCAN_QUOTA_PLANS[amount] || MIN_SCAN_QUOTA;
  
  // Find user and credit scans
  const userId = await findUserByEmail(email);
  await addScansAfterPayment(userId, txnid, amount, scanQuota);
  
  return new Response('SUCCESS');
});
```

#### **Database Triggers**
Automatic functions triggered by database events:

```sql
-- Auto-create profile on user registration
CREATE TRIGGER handle_new_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_registration();

-- Add free scans on email verification  
CREATE TRIGGER handle_email_verification
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_email_verification();
```

### **Authentication Layer**

#### **Supabase Auth Integration**
```typescript
// Authentication flow
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Session management
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    setUser(session.user);
    setIsAuthenticated(true);
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
    setIsAuthenticated(false);
  }
});
```

#### **Social Authentication**
```typescript
// Google OAuth flow
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: googleIdToken,
});
```

---

## **DATA FLOW PATTERNS**

### **1. Authentication Flow**
```
User Input → AuthContext → Supabase Auth → Database Trigger → Profile Creation → UI Update
```

1. User enters credentials in `LoginScreen`
2. `AuthContext.login()` calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials and returns JWT
4. `onAuthStateChange` updates global auth state
5. Database trigger ensures profile exists
6. UI automatically redirects to main app

### **2. Scan Processing Flow**
```
Camera → Quota Check → OCR Processing → Database Storage → UI Update
```

1. User opens `CameraScreen` and captures prescription
2. `processPrescriptionImage()` calls `supabase.rpc('process_prescription')`
3. Database function validates and deducts scan quota
4. Image uploaded to Supabase Storage
5. OCR service extracts text and medications
6. Results saved to `prescriptions` table
7. `AuthContext.refreshScansRemaining()` updates UI quota

### **3. Payment Processing Flow**
```
Payment Button → WebView → PayU Gateway → Webhook → Database Update → Real-time UI
```

1. User taps payment button in `SubscriptionScreen`
2. App opens PayU payment form in WebView
3. User completes payment on PayU gateway
4. PayU sends webhook to `supabase/functions/payu-webhook`
5. Edge function validates payment and calls `add_scans_after_payment()`
6. Database trigger creates payment notification
7. Real-time subscription updates UI with new quota

### **4. Notification Flow**
```
Database Event → Trigger → Notification Creation → Real-time Update → UI Badge
```

1. Database event occurs (payment, low quota, etc.)
2. Database trigger calls `create_notification()`
3. Notification inserted into `notifications` table
4. Real-time subscription pushes update to client
5. `NotificationContext` updates unread count
6. UI badge automatically reflects new count

---

## **ERROR HANDLING ARCHITECTURE**

### **1. Client-Side Error Handling**

#### **Global Error Boundary**
```typescript
// Error boundary for unhandled exceptions
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to crash analytics service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallbackScreen />;
    }
    return this.props.children;
  }
}
```

#### **API Error Handling**
```typescript
// Standardized error handling for Supabase calls
const handleSupabaseError = (error: any) => {
  const errorMessages = {
    'Invalid login credentials': 'Incorrect email or password.',
    'Email not confirmed': 'Please verify your email before logging in.',
    'Too many requests': 'Too many attempts. Please try again later.',
  };
  
  return errorMessages[error.message] || 'An unexpected error occurred.';
};
```

#### **Network Error Recovery**
```typescript
// Retry logic for network calls
const retryableRequest = async (request: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### **2. Server-Side Error Handling**

#### **RPC Function Error Handling**
```sql
-- PostgreSQL function with proper error handling
CREATE OR REPLACE FUNCTION process_prescription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check scan quota
  IF (SELECT scans_remaining FROM profiles WHERE id = user_id) <= 0 THEN
    RAISE EXCEPTION 'No scans remaining';
  END IF;
  
  -- Deduct scan (atomic operation)
  UPDATE profiles 
  SET scans_remaining = scans_remaining - 1 
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    INSERT INTO error_logs (function_name, error_message, user_id) 
    VALUES ('process_prescription', SQLERRM, user_id);
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Edge Function Error Handling**
```typescript
// PayU webhook with comprehensive error handling
Deno.serve(async (req: Request) => {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    // Process payment
    const result = await processPayment(formData);
    
    return new Response('SUCCESS', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Return success to prevent PayU retries for unrecoverable errors
    if (error.message.includes('User not found')) {
      return new Response('SUCCESS', { status: 200 });
    }
    
    // Return error for retryable issues
    return new Response('ERROR', { status: 500 });
  }
});
```

---

## **PERFORMANCE OPTIMIZATION**

### **1. React Native Optimizations**

#### **Component Memoization**
```typescript
// Memoize expensive components
const QuotaBadge = React.memo(({ scansRemaining, loading }: QuotaBadgeProps) => {
  const badgeColor = scansRemaining === 0 ? '#ef4444' : 
                    scansRemaining < 3 ? '#f97316' : '#22c55e';
  
  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
      <ThemedText style={styles.badgeText}>
        {loading ? '...' : scansRemaining}
      </ThemedText>
    </View>
  );
});
```

#### **List Optimization**
```typescript
// Efficient list rendering with FlatList
<FlatList
  data={notifications}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <NotificationItem notification={item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

#### **Image Optimization**
```typescript
// Optimized image loading with caching
<Image
  source={{ uri: prescriptionImageUrl }}
  style={styles.prescriptionImage}
  resizeMode="cover"
  defaultSource={require('../assets/placeholder.png')}
/>
```

### **2. Database Optimizations**

#### **Query Optimization**
```sql
-- Optimized queries with proper indexing
CREATE INDEX idx_prescriptions_user_created 
ON prescriptions(user_id, created_at DESC);

-- Efficient pagination
SELECT * FROM prescriptions 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20 OFFSET $2;
```

#### **Connection Pooling**
```typescript
// Supabase handles connection pooling automatically
// For custom optimizations, use prepared statements
const getQuotaStatement = supabase
  .from('profiles')
  .select('scans_remaining')
  .eq('id', supabase.auth.user()?.id);
```

### **3. Caching Strategies**

#### **In-Memory Caching**
```typescript
// Cache frequently accessed data
const cache = new Map();

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  
  // Auto-expire after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return data;
};
```

#### **AsyncStorage Caching**
```typescript
// Persistent local caching
const cacheService = {
  async get(key: string) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (1 hour)
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  },
  
  async set(key: string, data: any) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
};
```

---

## **SECURITY ARCHITECTURE**

### **1. Authentication Security**

#### **JWT Token Management**
```typescript
// Automatic token refresh with Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    // Token automatically included in all requests
    // Refresh handled automatically by Supabase client
  }
});
```

#### **Biometric Authentication** (Future Enhancement)
```typescript
// Optional biometric login
const enableBiometric = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (hasHardware) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to login',
      fallbackLabel: 'Use password',
    });
    return result.success;
  }
  return false;
};
```

### **2. Data Security**

#### **Encryption at Rest**
```typescript
// Sensitive data encryption with Expo SecureStore
const secureStorage = {
  async store(key: string, value: string) {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: true,
      accessControl: SecureStore.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    });
  },
  
  async retrieve(key: string) {
    return await SecureStore.getItemAsync(key);
  }
};
```

#### **Network Security**
```typescript
// HTTPS enforcement and certificate pinning
const supabase = createClient(url, key, {
  global: {
    fetch: (url, options = {}) => {
      // Ensure HTTPS
      if (!url.startsWith('https://')) {
        throw new Error('Only HTTPS connections allowed');
      }
      return fetch(url, options);
    }
  }
});
```

### **3. Input Validation**

#### **Client-Side Validation**
```typescript
// Input sanitization and validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000);   // Limit length
};
```

#### **Server-Side Validation**
```sql
-- Database-level validation
CREATE OR REPLACE FUNCTION validate_coupon_code(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow alphanumeric codes
  IF code !~ '^[A-Z0-9]+$' THEN
    RAISE EXCEPTION 'Invalid coupon code format';
  END IF;
  
  -- Length validation
  IF LENGTH(code) < 3 OR LENGTH(code) > 20 THEN
    RAISE EXCEPTION 'Coupon code must be 3-20 characters';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## **TESTING ARCHITECTURE**

### **1. Unit Testing**

#### **Component Testing with Jest & React Native Testing Library**
```typescript
// Component test example
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthContext } from '../components/AuthContext';
import LoginScreen from '../app/LoginScreen';

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const authValue = {
    login: mockLogin,
    loading: false,
    isAuthenticated: false,
  };

  it('should call login with correct credentials', async () => {
    const { getByTestId } = render(
      <AuthContext.Provider value={authValue}>
        <LoginScreen />
      </AuthContext.Provider>
    );

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

#### **Service Function Testing**
```typescript
// Service test example
import { processPrescriptionImage } from '../components/prescriptionService';
import { supabase } from '../components/supabaseClient';

jest.mock('../components/supabaseClient');

describe('PrescriptionService', () => {
  it('should check quota before processing', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ data: false });
    (supabase.rpc as jest.Mock) = mockRpc;

    await expect(
      processPrescriptionImage('image-uri', 'user-id')
    ).rejects.toThrow('No scans remaining');

    expect(mockRpc).toHaveBeenCalledWith('process_prescription', {
      user_id: 'user-id'
    });
  });
});
```

### **2. Integration Testing**

#### **Database Function Testing**
```sql
-- PostgreSQL function tests
BEGIN;
  -- Setup test data
  INSERT INTO profiles (id, email, scans_remaining) 
  VALUES ('test-user-id', 'test@example.com', 5);
  
  -- Test function
  SELECT process_prescription('test-user-id');
  
  -- Verify result
  SELECT scans_remaining FROM profiles WHERE id = 'test-user-id';
  -- Should be 4
  
ROLLBACK;
```

#### **End-to-End Testing with Detox**
```typescript
// E2E test example
describe('Complete Scan Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete prescription scan flow', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Navigate to camera
    await element(by.id('scan-button')).tap();

    // Capture image (mock)
    await element(by.id('capture-button')).tap();

    // Verify result screen
    await expect(element(by.id('processing-result'))).toBeVisible();
  });
});
```

### **3. Performance Testing**

#### **Load Testing for Edge Functions**
```typescript
// Load test for PayU webhook
const loadTest = async () => {
  const promises = Array.from({ length: 100 }, (_, i) => 
    fetch('https://project.supabase.co/functions/v1/payu-webhook', {
      method: 'POST',
      body: new URLSearchParams({
        amount: '149',
        email: `test${i}@example.com`,
        txnid: `txn_${i}`,
        status: 'success'
      })
    })
  );

  const results = await Promise.allSettled(promises);
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  console.log(`Success rate: ${successCount}/100`);
};
```

---

## **DEPLOYMENT ARCHITECTURE**

### **1. Client Deployment (Expo/EAS)**

#### **Build Configuration** (`eas.json`)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "development-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "development-key"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "production-url", 
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "production-key"
      }
    }
  }
}
```

#### **Environment Management**
```typescript
// Environment-specific configurations
const config = {
  development: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL_DEV,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_DEV,
    payuMerchantKey: process.env.EXPO_PUBLIC_PAYU_MERCHANT_KEY_TEST,
  },
  production: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    payuMerchantKey: process.env.EXPO_PUBLIC_PAYU_MERCHANT_KEY,
  }
};
```

### **2. Backend Deployment (Supabase)**

#### **Migration Management**
```sql
-- Version-controlled database migrations
-- supabase/migrations/20241201_add_coupon_system.sql
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  scans_amount INTEGER NOT NULL DEFAULT 0,
  max_redemptions INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon redemption function
CREATE OR REPLACE FUNCTION redeem_coupon(
  user_id UUID,
  coupon_code TEXT
) RETURNS TEXT AS $$
-- Function implementation
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Edge Function Deployment**
```bash
# Deploy Edge Functions
supabase functions deploy payu-webhook
supabase functions deploy create-payu-button

# Verify deployment
supabase functions list
```

### **3. CI/CD Pipeline**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy App
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

---

## **MONITORING & ANALYTICS**

### **1. Error Tracking**

#### **Crash Reporting with Expo**
```typescript
// Error logging and crash reporting
import * as Updates from 'expo-updates';

const logError = (error: Error, context?: string) => {
  console.error(`Error in ${context}:`, error);
  
  // Log to analytics service
  Analytics.recordError(error, {
    context,
    appVersion: Application.nativeApplicationVersion,
    updateId: Updates.updateId,
  });
};
```

### **2. Performance Monitoring**

#### **Database Query Monitoring**
```sql
-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### **Edge Function Monitoring**
```typescript
// Function performance logging
export const handler = async (req: Request) => {
  const startTime = Date.now();
  
  try {
    const result = await processRequest(req);
    
    const duration = Date.now() - startTime;
    console.log(`Function completed in ${duration}ms`);
    
    return new Response(JSON.stringify(result));
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Function failed after ${duration}ms:`, error);
    throw error;
  }
};
```

### **3. User Analytics**

#### **Usage Tracking**
```typescript
// Track user actions
const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  Analytics.track(eventName, {
    ...properties,
    userId: user?.id,
    timestamp: new Date().toISOString(),
    appVersion: Application.nativeApplicationVersion,
  });
};

// Usage examples
trackEvent('scan_completed', { prescriptionId, processingTime });
trackEvent('payment_successful', { amount, scansAdded });
trackEvent('coupon_redeemed', { couponCode, scansAdded });
```

---

## **BEST PRACTICES & CONVENTIONS**

### **1. Code Organization**

#### **File Structure Convention**
```
components/
├── ui/                     # Reusable UI components
├── context/               # React contexts
├── services/              # API and business logic
└── utils/                 # Helper functions

app/
├── (auth)/               # Authentication screens
├── (tabs)/               # Tab navigation screens
├── screens/              # Modal and stack screens
└── _layout.tsx           # Root layout

constants/
├── Colors.ts             # Theme colors
├── PaymentPlans.ts       # Payment configuration
└── API.ts                # API endpoints
```

#### **Naming Conventions**
```typescript
// Components: PascalCase
export const QuotaBadge = () => { };

// Functions: camelCase
const refreshScansRemaining = async () => { };

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;

// Types: PascalCase with descriptive suffixes
interface AuthContextType { }
type PaymentStatus = 'pending' | 'completed' | 'failed';
```

### **2. State Management Guidelines**

#### **Context Usage Rules**
```typescript
// Use contexts for:
// 1. Data needed across multiple screens
// 2. User authentication state
// 3. Global UI state (theme, notifications)

// Avoid contexts for:
// 1. Component-specific state
// 2. Form state
// 3. Temporary UI state
```

#### **Local State Patterns**
```typescript
// Use local state for:
const [loading, setLoading] = useState(false);        // Loading states
const [error, setError] = useState<string | null>(null); // Error states
const [formData, setFormData] = useState({});         // Form data

// Use refs for:
const inputRef = useRef<TextInput>(null);            // DOM references
const timeoutRef = useRef<NodeJS.Timeout>();         // Cleanup references
```

### **3. Performance Guidelines**

#### **Component Optimization**
```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <View>{processedData}</View>;
});

// Debounce user input
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useMemo(
  () => debounce((term: string) => performSearch(term), 300),
  []
);
```

#### **Database Query Guidelines**
```typescript
// Batch database operations
const batchOperations = async () => {
  const operations = [
    supabase.from('table1').insert(data1),
    supabase.from('table2').update(data2).eq('id', id),
    supabase.rpc('custom_function', params),
  ];
  
  const results = await Promise.allSettled(operations);
  return results;
};
```

---

**This architecture guide reflects the current React Native + Expo + Supabase implementation and will be updated as the system evolves.** 