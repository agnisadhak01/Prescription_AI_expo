# Taskmaster Rules: Quota Management System

## Overview
This document outlines the implementation plan for the scan quota management system in our Prescription AI app.

## Priority 1: Database Schema Updates

### Task 1.1: Add Quota Fields to User Profile
- [ ] Verify `user_profiles` table has `scans_remaining` field (integer, default 0)
- [ ] Verify `user_profiles` table has `total_scans_purchased` field (integer, default 0)

### Task 1.2: Create Scan Quota Transactions Table
- [ ] Create `scan_quota_transactions` table with fields:
  - id (primary key)
  - user_id (foreign key to auth.users)
  - amount (integer, can be positive or negative)
  - description (text)
  - transaction_type (enum: 'purchase', 'usage', 'refund', 'coupon', 'admin')
  - reference_id (optional, for payment IDs or coupon codes)
  - created_at (timestamp with timezone)

### Task 1.3: Create Database Functions
- [ ] Create `add_scan_quota` function to safely add quota to users
- [ ] Create `use_scan_quota` function to safely deduct quota with validation

## Priority 2: Backend Implementation

### Task 2.1: Supabase API Extensions
- [ ] Create RPC function to get current user quota
- [ ] Create secure endpoints for adding/using quota that invoke the DB functions

### Task 2.2: Payment Integration
- [ ] Update PayU webhook function to credit scans after successful payments
- [ ] Add transaction record for each payment
- [ ] Call `refreshScansRemaining()` after processing payment

### Task 2.3: Coupon Processing
- [ ] Create coupon validation and redemption logic
- [ ] Update quota when coupons are redeemed
- [ ] Call `refreshScansRemaining()` after processing coupon

## Priority 3: Frontend Context

### Task 3.1: Auth Context Extension
- [ ] Extend `useAuth()` context to include:
  - `scansRemaining` state
  - `refreshScansRemaining()` function
  - `useOptimisticScan()` hook for optimistic UI updates

### Task 3.2: Scan Quota Management
- [ ] Implement `refreshScansRemaining()` to fetch latest quota from API
- [ ] Add optimistic UI updates with local state management
- [ ] Add comments for all quota-related code per requirements

## Priority 4: UI Implementation

### Task 4.1: Quota Display Components
- [ ] Create consistent quota badge component
- [ ] Add to all necessary screens (home, scan, profile)
- [ ] Implement loading/error states

### Task 4.2: Scan Flow Integration
- [ ] Add pre-scan quota check to block scans when quota is 0
- [ ] Show appropriate error messages and redirect to subscription page
- [ ] Implement optimistic UI update for scan quota after scan

### Task 4.3: Subscription Screen Updates
- [ ] Update subscription screen to show current quota
- [ ] Add clear CTA when quota is depleted

## Priority 5: Error Handling

### Task 5.1: Network Error Handling
- [ ] Add error boundary for quota-related API calls
- [ ] Implement retry logic for failed quota updates
- [ ] Display user-friendly error messages via Alert.alert

### Task 5.2: Edge Cases
- [ ] Handle race conditions in quota updates
- [ ] Add offline support with queue for quota transactions
- [ ] Handle account linking/merging for quota

## Priority 6: Testing

### Task 6.1: Unit Tests
- [ ] Test database functions for quota management
- [ ] Test context providers and hooks
- [ ] Test optimistic UI updates

### Task 6.2: Integration Tests
- [ ] Test full scan flow with quota checks
- [ ] Test payment flow updating quota
- [ ] Test edge cases (0 quota, network errors)

### Task 6.3: Manual Testing Checklist
- [ ] Verify quota displays correctly on all screens
- [ ] Verify quota updates after scans/payments/coupons
- [ ] Verify proper handling of 0 quota state

## Priority 7: Deployment

### Task 7.1: Database Migration
- [ ] Create and test migration script
- [ ] Schedule maintenance window if needed
- [ ] Apply migration to production

### Task 7.2: Frontend Deployment
- [ ] Tag quota management release
- [ ] Deploy to TestFlight/internal testing
- [ ] Verify all quota features in staging

### Task 7.3: Production Release
- [ ] Final verification of quota system
- [ ] Deploy to production
- [ ] Monitor for issues

## Quick Reference Guide
- Always use global context (`useAuth()`) for user scan quota (`scansRemaining`, `refreshScansRemaining`).
- Don't use local state for scan quota unless for optimistic UI updates.
- After any action that changes quota (scan, payment, coupon), call `refreshScansRemaining()`.
- When a scan is processed, optimistically decrement the quota in the UI.
- If `scansRemaining` is 0 or less, block scan actions and redirect to subscription.
- Catch and show all API/network errors to the user.
- Use consistent badge and display style for scan quota across all screens.
- Add appropriate comments for quota-related code as specified in the requirements. 