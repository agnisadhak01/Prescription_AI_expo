# AI Prescription Saathi App Documentation

---

## Table of Contents
- [Overview](#overview)
- [Intended Purpose](#intended-purpose)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Main Features](#main-features)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Payment Integration (PayU)](#payment-integration-payu)
- [Security & Secrets](#security--secrets)
- [Key Rules & Automation](#key-rules--automation)
- [Setup Guide](#setup-guide)
- [References](#references)

---

## Overview
AI Prescription Saathi is a cross-platform mobile application (built with React Native/Expo) that allows users to scan, store, and manage medical prescriptions using OCR (Optical Character Recognition) and cloud storage. The app integrates with Supabase for authentication, database, and storage, and supports payment for additional scan quota via PayU.

---

## Intended Purpose
- **Target Users:** Patients, caregivers, and healthcare professionals who need to digitize, organize, and manage medical prescriptions.
- **Core Goal:** Make prescription management easy, searchable, and secure, while enabling users to extract structured data from handwritten or printed prescriptions using AI-powered OCR.

---

## How It Works
1. **User Authentication:**
   - Users register and log in using email/password (Supabase Auth).
   - Email verification is required for full access.

2. **Scan Quota System:**
   - Each user has a limited number of prescription scans (quota).
   - Quota is managed globally via context (`useAuth()`), and is refreshed after every scan, payment, or coupon redemption.
   - If quota is exhausted, users are prompted to purchase more scans.

3. **Prescription Scanning:**
   - Users can capture a prescription image using the camera or upload from the gallery.
   - The image is sent to an OCR webhook endpoint, which returns structured prescription data in JSON format.
   - The app parses and displays the extracted data for user review.

4. **Data Storage:**
   - Processed prescriptions (including medications, doctor/patient info, and images) are stored in Supabase tables and storage buckets.
   - Users can view, search, and delete their stored prescriptions.

5. **Payment Integration:**
   - Users can buy additional scan quota via PayU payment gateway.
   - Payment is handled in a WebView modal; scan quota is only credited after backend webhook confirmation.

6. **Security:**
   - All sensitive operations use secure authentication and Row Level Security (RLS) in the database.
   - API keys and secrets are managed securely (see [Security & Secrets](#security--secrets)).

---

## Architecture
- **Frontend:** React Native (Expo), TypeScript, file-based routing, global context for auth/quota.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **OCR Service:** External webhook endpoint for image-to-JSON processing.
- **Payment:** PayU integration via Supabase Edge Functions and webhook.

**Layers:**
- Presentation: Screens, navigation, UI state, context providers.
- Domain: Business logic, validation, error handling.
- Data: API clients, repositories, storage, database models.

---

## Main Features
- **User Authentication:** Register, login, password reset, email verification.
- **Scan Quota Management:** View, refresh, and purchase scan credits.
- **Prescription Scanning:** Camera capture, image upload, OCR processing.
- **Prescription Management:** List, search, view, and delete prescriptions.
- **Payment Integration:** Buy scan credits via PayU, with secure webhook handling.
- **Error Handling:** All errors are caught and shown to the user with alerts.
- **Consistent UI:** Scan quota badge, loading states, and accessibility best practices.

---

## Data Flow
1. **Image Capture:** User takes or uploads a prescription image.
2. **OCR Processing:** Image is sent to the webhook, which returns structured JSON data.
3. **Data Parsing:** App parses the JSON and displays extracted info (doctor, patient, medications, etc.).
4. **Storage:** User saves the prescription, which is stored in Supabase (prescriptions, medications, images tables).
5. **Quota Update:** Scan quota is decremented and refreshed from the backend.
6. **Payment:** If quota is low, user can purchase more scans; payment is processed and quota is updated after webhook confirmation.

---

## Database Schema
- **users:** User accounts (id, email, name, etc.)
- **prescriptions:** Prescription records (id, user_id, doctor_name, patient_name, date, diagnosis, notes)
- **medications:** Medications linked to prescriptions (id, prescription_id, name, dosage, frequency, duration, instructions)
- **prescription_images:** Images linked to prescriptions (id, prescription_id, image_url)
- **user_sessions:** Tracks user sessions/devices
- **payment_transactions:** Tracks PayU payments and scan quota credits

**Security:**
- Row Level Security (RLS) ensures users can only access their own data.
- Policies for select, insert, update, delete on all tables.

---

## Payment Integration (PayU)
- **Flow:**
  1. User initiates payment in the app (WebView modal).
  2. PayU processes payment and calls a Supabase Edge Function webhook.
  3. Webhook validates and credits scan quota if payment is successful.
  4. App refreshes quota after backend confirmation.
- **Security:**
  - Webhook checks for duplicate transactions before crediting scans.
  - Only backend webhook can credit scans (never the app directly).
  - Webhook handles both URL-encoded and JSON payloads.
- **Testing:**
  - Use PayU test cards for development.
  - Webhook endpoint must be publicly accessible and tested with manual POSTs.

---

## Security & Secrets
- **Supabase URL/Key:** Stored in `supabaseClient.ts` (should be secured in production).
- **Webhook Auth:** Basic Auth for OCR webhook; credentials should be rotated and not committed to source control.
- **Data Encryption:** Sensitive data is encrypted at rest and in transit.
- **Network Security:** All API calls use HTTPS; network security config restricts allowed domains.
- **Best Practices:** Never commit real credentials; use environment variables for production.

---

## Key Rules & Automation
- **Scan Quota:** Always use global context for quota; refresh after every scan/payment; block scans if quota is 0.
- **Error Handling:** All errors must be shown to the user and logged.
- **UI Consistency:** Use the same badge and style for scan quota across all screens.
- **Payment:** Only credit scans after webhook confirmation; never from UI alone.
- **Refactoring:** Extract duplicate logic; keep all rules in sync between `cursor-ai-rules.txt` and `.cursor/rules/prescription-rules.mdc`.
- **Testing:** Always test webhook endpoints with both manual and real transactions.
- **Accessibility:** Ensure minimum touch target size and avoid UI elements being blocked by system overlays.

---

## Setup Guide
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the app:**
   ```bash
   npx expo start
   ```
3. **Configure Supabase:**
   - Set up tables and storage as per `database_setup_guide.md` and `database_schema.md`.
   - Update `supabaseClient.ts` with your project URL and anon key.
4. **Deploy Edge Functions:**
   - Use Supabase CLI to deploy payment and webhook functions.
5. **Test:**
   - Register/login, scan a prescription, and test payment flow.

---

## References
- [database_setup_guide.md](database_setup_guide.md)
- [docs/architecture_guide.md](docs/architecture_guide.md)
- [docs/data_models.md](docs/data_models.md)
- [docs/database_schema.md](docs/database_schema.md)
- [docs/payu_integration.md](docs/payu_integration.md)
- [cursor-ai-rules.txt](cursor-ai-rules.txt)
- [docs/ui_documentation.md](docs/ui_documentation.md)
- [docs/secrets_documentation.md](docs/secrets_documentation.md)
- [docs/functions_documentation.md](docs/functions_documentation.md)
- [docs/variables_documentation.md](docs/variables_documentation.md)

---

For further details, see the referenced markdown files in the `docs/` directory and the codebase itself. 