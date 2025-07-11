# Data Models Documentation

**Last Updated**: December 2024  
**Tech Stack**: React Native + TypeScript + Supabase PostgreSQL  
**Type System**: TypeScript with strict type checking

## Overview

The Prescription AI app uses **TypeScript interfaces** for type safety and **Supabase database schemas** for data persistence. This document covers all data models used throughout the application, from database tables to UI component types.

---

## **DATABASE SCHEMAS (SUPABASE)**

These are the actual PostgreSQL table schemas in the Supabase database.

### **1. Profiles Table**
**Purpose**: Primary user data with scan quota management  
**Source**: Auto-created from `auth.users` via database trigger

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  scans_remaining INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  scans_remaining: number;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}
```

### **2. Prescriptions Table**
**Purpose**: Store prescription metadata and OCR results  
**Relationships**: Belongs to `profiles`, has many `prescription_images`

```sql
CREATE TABLE prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  extracted_text TEXT,
  ocr_confidence DECIMAL(3,2),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'completed', 'failed')),
  patient_name TEXT,
  doctor_name TEXT,
  diagnosis TEXT,
  instructions TEXT,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface Prescription {
  id: string;
  user_id: string;
  image_url?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  processing_status: 'pending' | 'completed' | 'failed';
  patient_name?: string;
  doctor_name?: string;
  diagnosis?: string;
  instructions?: string;
  scan_date: string;
  created_at: string;
}
```

### **3. Medications Table**
**Purpose**: Store detailed medication information from prescriptions  
**Relationships**: Belongs to `prescriptions`

```sql
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT,    -- tablet, capsule, syrup, injection, etc.
  strength TEXT,       -- 10mg, 500mg, etc.
  frequency TEXT,      -- "3 times a day", "twice daily", etc.
  duration TEXT,       -- "7 days", "2 weeks", etc.
  timing TEXT,         -- "after meals", "before sleep", etc.
  purpose TEXT,        -- "for pain", "for infection", etc.
  manufacturer TEXT,
  side_effects TEXT,
  precautions TEXT,
  alternatives TEXT[], -- Array of alternative medication names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface Medication {
  id: string;
  prescription_id: string;
  medicine_name: string;
  generic_name?: string;
  dosage_form?: string;
  strength?: string;
  frequency?: string;
  duration?: string;
  timing?: string;
  purpose?: string;
  manufacturer?: string;
  side_effects?: string;
  precautions?: string;
  alternatives?: string[];
  created_at: string;
}
```

### **4. Prescription Images Table**
**Purpose**: Store multiple images per prescription with OCR metadata  
**Relationships**: Belongs to `prescriptions`

```sql
CREATE TABLE prescription_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_size INTEGER,    -- File size in bytes
  image_format TEXT,     -- jpg, png, etc.
  ocr_data JSONB,       -- Raw OCR response
  processing_time INTEGER, -- Time taken to process in ms
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface PrescriptionImage {
  id: string;
  prescription_id: string;
  image_url: string;
  image_size?: number;
  image_format?: string;
  ocr_data?: Record<string, any>;
  processing_time?: number;
  confidence_score?: number;
  created_at: string;
}
```

### **5. Notifications Table**
**Purpose**: Store user notifications with read status  
**Relationships**: Belongs to `profiles`

```sql
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,       -- Additional data (payment amount, scan count, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);
```

**TypeScript Interface**:
```typescript
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}
```

### **6. Payment Transactions Table**
**Purpose**: Store PayU payment history and scan credits  
**Relationships**: Belongs to `profiles`

```sql
CREATE TABLE payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,    -- PayU transaction ID
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  scans_added INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT,                    -- card, netbanking, upi, etc.
  gateway_response JSONB,                 -- Full PayU response
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**TypeScript Interface**:
```typescript
interface PaymentTransaction {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  scans_added: number;
  payment_method?: string;
  gateway_response?: Record<string, any>;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  completed_at?: string;
}
```

### **7. Coupons Table**
**Purpose**: Store coupon codes and redemption rules  
**Global table**: Not user-specific

```sql
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  scans_amount INTEGER NOT NULL DEFAULT 0,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface Coupon {
  id: string;
  code: string;
  scans_amount: number;
  max_redemptions?: number;
  current_redemptions: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}
```

### **8. Scan Quota Transactions Table**
**Purpose**: Audit trail for all scan quota changes  
**Relationships**: Belongs to `profiles`

```sql
CREATE TABLE scan_quota_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,                -- Positive for credits, negative for debits
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('scan_used', 'payment', 'coupon', 'admin', 'verification_bonus', 'refund')),
  reference_id TEXT,                      -- Payment ID, coupon code, etc.
  description TEXT,
  balance_after INTEGER NOT NULL,         -- Quota balance after this transaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**TypeScript Interface**:
```typescript
interface ScanQuotaTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'scan_used' | 'payment' | 'coupon' | 'admin' | 'verification_bonus' | 'refund';
  reference_id?: string;
  description?: string;
  balance_after: number;
  created_at: string;
}
```

---

## **REACT NATIVE CLIENT TYPES**

These TypeScript interfaces are used in the React Native application for type safety and IntelliSense.

### **Authentication Context Types**

```typescript
interface AuthContextType {
  // Authentication State
  isAuthenticated: boolean;
  user: AuthUser | null;
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

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  email_confirmed_at?: string;
  created_at: string;
}
```

### **Notification Context Types**

```typescript
interface NotificationContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  
  // Methods
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Real-time Updates
  isConnected: boolean;
}
```

### **UI Component Types**

#### **Quota Badge Component**
```typescript
interface QuotaBadgeProps {
  scansRemaining: number | null;
  loading: boolean;
  variant?: 'default' | 'large' | 'small';
  showText?: boolean;
}
```

#### **Notification Icon Component**
```typescript
interface NotificationIconProps {
  unreadCount: number;
  size?: number;
  color?: string;
  onPress?: () => void;
}
```

#### **Camera Screen Types**
```typescript
interface CameraScreenProps {
  onImageCaptured: (imageUri: string) => void;
  onCancel: () => void;
}

interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  size?: number;
  type?: string;
}
```

#### **Prescription Result Types**
```typescript
interface ProcessingResultProps {
  prescription: Prescription;
  medications: Medication[];
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}
```

---

## **API RESPONSE TYPES**

### **OCR Webhook Response**
**Purpose**: Response from external OCR service processing prescription images

```typescript
interface OCRResponse {
  success: boolean;
  confidence: number;
  processing_time: number;
  patient_details: {
    name?: string;
    age?: string | number;
    patient_id?: string;
    contact?: string;
    address?: string;
  };
  doctor_details: {
    name?: string;
    qualifications?: string;
    specialization?: string;
    license_number?: string;
    contact?: string;
    chambers?: string;
    visiting_hours?: string;
  };
  medications: {
    brand_name: string;
    generic_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    purpose?: string;
    instructions?: string;
    side_effects?: string;
    precautions?: string;
    alternatives?: string[];
  }[];
  general_instructions?: string;
  additional_info?: string;
  diagnosis?: string;
  error?: string;
}
```

### **PayU Webhook Data**
**Purpose**: Payment data received from PayU gateway

```typescript
interface PayUWebhookData {
  // Payment Information
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  
  // Payment Details
  status: 'success' | 'failure' | 'pending';
  mihpayid: string;
  mode: string;           // CC, DC, NB, UPI, etc.
  bank_ref_num?: string;
  bankcode?: string;
  
  // Security
  hash: string;
  field1?: string;
  field2?: string;
  
  // Timestamps
  addedon: string;
  payment_source?: string;
  PG_TYPE?: string;
  error?: string;
  error_Message?: string;
}
```

### **Supabase RPC Response Types**
**Purpose**: Response types for database function calls

```typescript
// Coupon Redemption Response
type CouponRedemptionResult = 
  | 'success' 
  | 'invalid_coupon' 
  | 'already_used' 
  | 'expired_coupon' 
  | 'max_redemptions_reached';

// Notification Fetch Response
interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;        // Calculated field: "2 hours ago"
}

// Scan History Response
interface ScanHistoryItem {
  id: string;
  scan_date: string;
  patient_name?: string;
  doctor_name?: string;
  medication_count: number;
  time_ago: string;
}
```

---

## **FORM DATA TYPES**

### **Authentication Forms**

```typescript
interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### **Payment Forms**

```typescript
interface PaymentFormData {
  amount: number;
  productInfo: string;
  firstName: string;
  email: string;
  phone?: string;
}

interface CouponFormData {
  couponCode: string;
}
```

### **Profile Forms**

```typescript
interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
}
```

---

## **UTILITY TYPES**

### **Navigation Types**

```typescript
// Expo Router navigation types
interface NavigationParams {
  // Auth screens
  'login': undefined;
  'register': undefined;
  'forgot-password': undefined;
  'verify-otp': { email: string };
  'reset-password': { token: string };
  
  // Main screens
  'camera': undefined;
  'subscription': undefined;
  'processing-result': { prescriptionId: string };
  'price-chart': undefined;
  
  // Info screens
  'terms-of-service': undefined;
  'privacy-policy': undefined;
  'medical-disclaimer': undefined;
  'about': undefined;
  'contact': undefined;
}
```

### **Error Types**

```typescript
interface AppError {
  message: string;
  code?: string;
  context?: string;
  timestamp: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface APIError {
  status: number;
  message: string;
  details?: Record<string, any>;
}
```

### **Loading States**

```typescript
interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

---

## **VALIDATION SCHEMAS**

### **Zod Validation Schemas**
**Purpose**: Runtime type validation for forms and API data

```typescript
import { z } from 'zod';

// User Registration Schema
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Coupon Code Schema
export const couponSchema = z.object({
  couponCode: z.string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20, 'Coupon code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Coupon code must contain only uppercase letters and numbers')
});

// Payment Amount Schema
export const paymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum payment is ₹1')
    .max(10000, 'Maximum payment is ₹10,000'),
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional()
});
```

---

## **DATABASE RELATIONSHIPS**

### **Entity Relationship Diagram**

```
auth.users (Supabase Auth)
    ↓ (1:1, auto-created via trigger)
profiles
    ↓ (1:many)
    ├── prescriptions
    │       ↓ (1:many)
    │       ├── medications
    │       └── prescription_images
    ├── notifications
    ├── payment_transactions
    └── scan_quota_transactions

coupons (global, not user-specific)
```

### **Foreign Key Relationships**

```sql
-- All user data cascades on user deletion
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_auth_users 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE prescriptions ADD CONSTRAINT fk_prescriptions_user 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE medications ADD CONSTRAINT fk_medications_prescription 
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX idx_prescriptions_user_date ON prescriptions(user_id, created_at DESC);
CREATE INDEX idx_medications_prescription ON medications(prescription_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id, created_at DESC);
```

---

## **TYPE GUARDS AND UTILITY FUNCTIONS**

### **Type Guards**
**Purpose**: Runtime type checking for dynamic data

```typescript
// Check if user is authenticated
export const isAuthenticatedUser = (user: any): user is AuthUser => {
  return user && typeof user.id === 'string' && typeof user.email === 'string';
};

// Check if notification is valid
export const isValidNotification = (data: any): data is Notification => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.message === 'string' &&
    typeof data.is_read === 'boolean';
};

// Check if payment transaction is completed
export const isCompletedPayment = (transaction: PaymentTransaction): boolean => {
  return transaction.status === 'completed' && 
    transaction.completed_at !== null &&
    transaction.scans_added > 0;
};
```

### **Data Transformation Utilities**

```typescript
// Convert database timestamp to relative time
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

// Transform OCR response to database format
export const transformOCRToPrescription = (
  ocrResponse: OCRResponse, 
  userId: string, 
  imageUrl: string
): Partial<Prescription> => {
  return {
    user_id: userId,
    image_url: imageUrl,
    extracted_text: JSON.stringify(ocrResponse),
    ocr_confidence: ocrResponse.confidence,
    processing_status: ocrResponse.success ? 'completed' : 'failed',
    patient_name: ocrResponse.patient_details?.name || null,
    doctor_name: ocrResponse.doctor_details?.name || null,
    diagnosis: ocrResponse.diagnosis || null,
    instructions: ocrResponse.general_instructions || null,
  };
};

// Transform database medications to UI format
export const formatMedicationForDisplay = (medication: Medication): string => {
  const parts = [
    medication.medicine_name,
    medication.strength && `(${medication.strength})`,
    medication.frequency && `- ${medication.frequency}`,
    medication.duration && `for ${medication.duration}`
  ].filter(Boolean);
  
  return parts.join(' ');
};
```

---

## **CONSTANTS AND ENUMS**

### **Payment Plans**

```typescript
export const PAYMENT_PLANS = {
  149: {
    amount: 149,
    scans: 5,
    popular: false,
    description: 'Basic Plan'
  },
  999: {
    amount: 999,
    scans: 15,
    popular: true,
    description: 'Most Popular',
    savings: '33% savings'
  },
  1999: {
    amount: 1999,
    scans: 35,
    popular: false,
    description: 'Best Value',
    savings: '43% savings'
  }
} as const;

export type PaymentPlanAmount = keyof typeof PAYMENT_PLANS;
```

### **Notification Types**

```typescript
export const NOTIFICATION_TYPES = {
  SCAN_QUOTA_LOW: 'scan_quota_low',
  SCAN_QUOTA_EMPTY: 'scan_quota_empty',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  COUPON_APPLIED: 'coupon_applied',
  EMAIL_VERIFIED: 'email_verified',
  WELCOME: 'welcome'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
```

### **Processing Status**

```typescript
export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

---

## **MIGRATION TYPES**

### **Database Migration Scripts**

```typescript
interface MigrationScript {
  version: string;
  description: string;
  up: string;    // SQL to apply migration
  down: string;  // SQL to rollback migration
}

// Example migration for adding scan quota tracking
export const addScanQuotaTrackingMigration: MigrationScript = {
  version: '20241201_001',
  description: 'Add scan quota transaction tracking',
  up: `
    CREATE TABLE scan_quota_transactions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      reference_id TEXT,
      description TEXT,
      balance_after INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_scan_quota_transactions_user 
    ON scan_quota_transactions(user_id, created_at DESC);
  `,
  down: `
    DROP INDEX IF EXISTS idx_scan_quota_transactions_user;
    DROP TABLE IF EXISTS scan_quota_transactions;
  `
};
```

---

## **TESTING TYPES**

### **Mock Data Types**

```typescript
// Mock user for testing
export const mockUser: AuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  },
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString()
};

// Mock prescription for testing
export const mockPrescription: Prescription = {
  id: 'test-prescription-id',
  user_id: 'test-user-id',
  image_url: 'https://example.com/image.jpg',
  extracted_text: '{"patient_name": "John Doe"}',
  ocr_confidence: 0.95,
  processing_status: 'completed',
  patient_name: 'John Doe',
  doctor_name: 'Dr. Smith',
  diagnosis: 'Common Cold',
  instructions: 'Rest and take medication as prescribed',
  scan_date: new Date().toISOString(),
  created_at: new Date().toISOString()
};

// Mock payment transaction for testing
export const mockPaymentTransaction: PaymentTransaction = {
  id: 'test-payment-id',
  user_id: 'test-user-id',
  transaction_id: 'TXN_TEST_123',
  amount: 149,
  currency: 'INR',
  scans_added: 5,
  payment_method: 'card',
  gateway_response: { status: 'success' },
  status: 'completed',
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString()
};
```

---

## **PERFORMANCE CONSIDERATIONS**

### **Query Optimization Types**

```typescript
// Pagination parameters
interface PaginationOptions {
  limit: number;
  offset: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Optimized query response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Example usage
type PaginatedNotifications = PaginatedResponse<Notification>;
type PaginatedPrescriptions = PaginatedResponse<Prescription>;
```

### **Caching Types**

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

---

**This data models documentation reflects the current TypeScript + Supabase implementation and includes all types used throughout the application. All interfaces are kept in sync with the actual database schema and React Native components.** 