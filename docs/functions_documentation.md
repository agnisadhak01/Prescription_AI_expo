# Functions Documentation - Prescription AI Saathi

## Overview
This document provides comprehensive documentation for all database functions, Edge Functions, and utility functions in the Prescription AI Saathi application.

## Database Functions

### Core Functions

#### 1. `redeem_coupon(user_id UUID, coupon_code TEXT)`
**Status**: ✅ **ACTIVE**
**Purpose**: Redeem coupon codes for scan quota
**Location**: Database function

**Parameters**:
- `user_id`: UUID of the user redeeming the coupon
- `coupon_code`: TEXT coupon code to redeem

**Returns**: TEXT status message
- `'success'` - Coupon redeemed successfully
- `'invalid_coupon'` - Coupon code not found or inactive
- `'already_used'` - User has already used this coupon
- `'expired_coupon'` - Coupon has expired
- `'max_redemptions_reached'` - Coupon usage limit reached
- `'user_not_found'` - User profile not found
- `'error'` - General error occurred

**Usage**:
```sql
SELECT redeem_coupon('user-uuid', 'WELCOME5');
```

**Implementation**:
- Validates coupon exists and is active
- Checks coupon expiry date
- Verifies user hasn't already used the coupon
- Updates user's scan quota
- Records redemption in `coupon_redemptions` table
- Updates coupon usage count

#### 2. `get_current_user_quota()`
**Status**: ✅ **ACTIVE**
**Purpose**: Get current user's scan quota
**Location**: Database function

**Parameters**: None (uses `auth.uid()`)

**Returns**: INTEGER representing scans remaining

**Usage**:
```sql
SELECT get_current_user_quota();
```

**Implementation**:
- Reads from `profiles` table
- Returns `scans_remaining` for current user
- Used by AuthContext for global quota management

#### 3. `add_scan_quota(user_id UUID, amount INTEGER, transaction_type scan_transaction_type, reference_id TEXT)`
**Status**: ✅ **ACTIVE**
**Purpose**: Add scan quota to user account with audit trail
**Location**: Database function

**Parameters**:
- `user_id`: UUID of the user
- `amount`: INTEGER amount to add (can be negative)
- `transaction_type`: scan_transaction_type enum
- `reference_id`: TEXT reference for the transaction

**Returns**: BOOLEAN success status

**Transaction Types**:
- `'payment'` - Payment-based quota addition
- `'coupon'` - Coupon redemption
- `'admin'` - Administrative adjustment
- `'usage'` - Scan usage deduction

**Usage**:
```sql
SELECT add_scan_quota('user-uuid', 5, 'coupon', 'WELCOME5');
```

**Implementation**:
- Updates `profiles.scans_remaining`
- Records transaction in `scan_quota_transactions`
- Maintains audit trail with before/after balances

#### 4. `process_prescription(image_data BYTEA, user_id UUID)`
**Status**: ✅ **ACTIVE**
**Purpose**: Process prescription images and extract medication data
**Location**: Database function

**Parameters**:
- `image_data`: BYTEA image data
- `user_id`: UUID of the user

**Returns**: JSON with extracted medication information

**Usage**:
```sql
SELECT process_prescription(image_data, 'user-uuid');
```

**Implementation**:
- Validates user has sufficient scan quota
- Processes image data for OCR
- Extracts medication information
- Deducts scan quota
- Returns structured medication data

### Functions Requiring Updates

#### 1. `add_scans_after_payment(user_id UUID, amount INTEGER, transaction_id TEXT)`
**Status**: ⚠️ **NEEDS UPDATE**
**Purpose**: Process PayU webhook payments
**Issue**: Updates `users` table instead of `profiles`

**Required Fix**:
```sql
-- Update function to use profiles table
UPDATE profiles 
SET scans_remaining = scans_remaining + amount
WHERE id = user_id;
```

#### 2. `handle_new_user(user_id UUID, email TEXT)`
**Status**: ⚠️ **NEEDS UPDATE**
**Purpose**: Create new user profile
**Issue**: Creates records in `users` instead of `profiles`

**Required Fix**:
```sql
-- Update function to use profiles table
INSERT INTO profiles (id, auth_id, email)
VALUES (user_id, user_id, email);
```

### Utility Functions

#### 1. `find_user_by_email(email TEXT)`
**Status**: ✅ **ACTIVE**
**Purpose**: Find user ID by email address
**Returns**: UUID of user or NULL if not found

#### 2. `ensure_verified_user_quota()`
**Status**: ✅ **ACTIVE**
**Purpose**: Ensure verified users have minimum scan quota
**Returns**: BOOLEAN success status

#### 3. `update_coupon_updated_at()`
**Status**: ✅ **ACTIVE**
**Purpose**: Trigger function to update coupon timestamps
**Trigger**: Automatically updates `updated_at` on coupon changes

## Edge Functions

### 1. PayU Webhook (`/functions/v1/payu-webhook`)
**Status**: ✅ **ACTIVE**
**Location**: `supabase/functions/payu-webhook/index.ts`

**Purpose**: Handle PayU payment confirmations

**Features**:
- Validates PayU webhook signatures
- Prevents duplicate transaction processing
- Updates user scan quota
- Records payment transaction
- Sends confirmation notification

**Configuration**:
```toml
[functions.payu-webhook]
enabled = true
verify_jwt = false
import_map = "./functions/payu-webhook/deno.json"
entrypoint = "./functions/payu-webhook/index.ts"
```

**Webhook Flow**:
1. Receives payment confirmation from PayU
2. Validates transaction signature
3. Checks for duplicate processing
4. Updates user scan quota
5. Records transaction details
6. Sends user notification

### 2. Create PayU Button (`/functions/v1/create-payu-button`)
**Status**: ✅ **ACTIVE**
**Location**: `supabase/functions/create-payu-button/index.ts`

**Purpose**: Generate PayU payment buttons

**Features**:
- Creates payment URLs for different scan packages
- Handles payment amount calculations
- Generates secure payment links
- Supports multiple payment plans

**Configuration**:
```toml
[functions.create-payu-button]
verify_jwt = false
```

## Notification Functions

### 1. `get_user_notifications(include_read BOOLEAN, fetch_limit INTEGER, fetch_offset INTEGER)`
**Status**: ✅ **ACTIVE**
**Purpose**: Fetch user notifications with pagination

**Parameters**:
- `include_read`: Whether to include read notifications
- `fetch_limit`: Maximum number of notifications to return
- `fetch_offset`: Offset for pagination

**Returns**: TABLE of notifications

### 2. `mark_notification_read(notification_id UUID, mark_as_read BOOLEAN)`
**Status**: ✅ **ACTIVE**
**Purpose**: Mark individual notification as read/unread

**Returns**: BOOLEAN success status

### 3. `mark_all_notifications_read()`
**Status**: ✅ **ACTIVE**
**Purpose**: Mark all user notifications as read

**Returns**: INTEGER number of notifications marked

### 4. `count_unread_notifications()`
**Status**: ✅ **ACTIVE**
**Purpose**: Get count of unread notifications

**Returns**: INTEGER count of unread notifications

### 5. `create_notification(user_id UUID, title TEXT, message TEXT, type TEXT, metadata JSONB)`
**Status**: ✅ **ACTIVE**
**Purpose**: Create new notification

**Returns**: UUID of created notification

## Trigger Functions

### 1. `trigger_scan_quota_notification()`
**Status**: ✅ **ACTIVE**
**Purpose**: Auto-notify when scan quota is low
**Trigger**: ON UPDATE to `profiles.scans_remaining`

**Implementation**:
- Creates notification when scans < 3
- Creates notification when scans = 0
- Sends appropriate warning messages

### 2. `trigger_payment_notification()`
**Status**: ✅ **ACTIVE**
**Purpose**: Notify on successful payments
**Trigger**: ON INSERT/UPDATE to `payment_transactions`

**Implementation**:
- Creates payment confirmation notification
- Includes transaction details
- Sends success message to user

### 3. `handle_new_user_registration()`
**Status**: ✅ **ACTIVE**
**Purpose**: Auto-create profile when user registers
**Trigger**: ON INSERT to `auth.users`

**Implementation**:
- Creates profile entry with 0 scans
- Sets up initial user data
- Prepares for email verification bonus

### 4. `handle_email_verification()`
**Status**: ✅ **ACTIVE**
**Purpose**: Add free scans when user verifies email
**Trigger**: ON UPDATE to `auth.users` when email confirmed

**Implementation**:
- Adds 3 free scans to user quota
- Records action in scan history
- Sends welcome notification

## Recent Function Updates

### December 2024 Updates

#### 1. Coupon System Functions
- **Added**: `redeem_coupon()` function
- **Added**: `update_coupon_updated_at()` trigger
- **Enhanced**: Coupon validation and tracking

#### 2. Quota Management Functions
- **Enhanced**: `add_scan_quota()` with better audit trail
- **Updated**: `get_current_user_quota()` to use profiles table
- **Improved**: Transaction tracking and logging

#### 3. Notification Functions
- **Enhanced**: Pagination support for notifications
- **Added**: Bulk notification operations
- **Improved**: Notification type handling

## Function Security

### Security Measures
1. **SECURITY DEFINER**: All functions use elevated privileges
2. **User Validation**: Functions validate `auth.uid()` for user-specific operations
3. **Input Validation**: All inputs are validated and sanitized
4. **Transaction Safety**: Payment functions include duplicate prevention
5. **RLS Integration**: Functions respect Row Level Security policies

### Access Control
- **Authenticated Users**: Can access user-specific functions
- **Admin Functions**: Require elevated privileges
- **Payment Functions**: Include signature validation
- **Notification Functions**: User-scoped access only

## Performance Considerations

### Optimization Strategies
1. **Indexed Queries**: Functions use indexed columns for performance
2. **Batch Operations**: Bulk operations for efficiency
3. **Caching**: Client-side caching for frequently accessed data
4. **Connection Pooling**: Efficient database connection management

### Monitoring
1. **Function Performance**: Monitor execution times
2. **Error Rates**: Track function failure rates
3. **Usage Patterns**: Analyze function usage statistics
4. **Resource Usage**: Monitor database resource consumption

## Testing Functions

### Test Scenarios
1. **Coupon Redemption**:
   ```sql
   -- Test WELCOME5 coupon
   SELECT redeem_coupon('test-user-id', 'WELCOME5');
   ```

2. **Quota Management**:
   ```sql
   -- Test quota addition
   SELECT add_scan_quota('test-user-id', 5, 'admin', 'test');
   ```

3. **Payment Processing**:
   ```sql
   -- Test payment webhook
   SELECT add_scans_after_payment('test-user-id', 5, 'test-txn');
   ```

### Test Data
- Use test user accounts for function testing
- Create test coupons for validation
- Use mock payment transactions
- Verify audit trail accuracy

## Error Handling

### Common Errors
1. **User Not Found**: Handle missing user profiles
2. **Insufficient Quota**: Validate scan quota before operations
3. **Duplicate Transactions**: Prevent double processing
4. **Invalid Input**: Validate all function parameters

### Error Responses
- **Consistent Error Codes**: Standardized error messages
- **Detailed Logging**: Comprehensive error logging
- **User Feedback**: Clear error messages for users
- **Recovery Procedures**: Automatic error recovery where possible

## Future Enhancements

### Planned Functions
1. **Advanced Analytics**: User behavior analysis functions
2. **Bulk Operations**: Batch processing functions
3. **Data Export**: User data export functions
4. **Admin Tools**: Administrative management functions

### Performance Improvements
1. **Function Optimization**: Query performance improvements
2. **Caching Strategy**: Enhanced caching implementation
3. **Async Processing**: Background task processing
4. **Monitoring**: Advanced function monitoring

## Documentation Maintenance

### Update Schedule
- **Monthly**: Review function performance and usage
- **Quarterly**: Update function documentation
- **Release**: Update with new function features
- **Security**: Regular security review and updates

### Version Control
- **Function Changes**: Track all function modifications
- **Migration History**: Maintain migration documentation
- **Rollback Procedures**: Document rollback processes
- **Testing Procedures**: Update testing documentation

---

*This functions documentation reflects the current state of the Prescription AI Saathi application as of v1.0.6. For the most up-to-date information, refer to the latest codebase and database schema.* 