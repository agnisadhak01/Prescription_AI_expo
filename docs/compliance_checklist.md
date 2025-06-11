# AI Prescription Saathi - Google Play Compliance Checklist

Use this practical checklist to ensure all compliance requirements are met before submission.

## Pre-Submission Compliance Review

### Medical & Health Disclaimers

- [ ] Non-medical device disclaimer on:
  - [ ] App Store listing (both short and full description)
  - [ ] First app open / onboarding screens
  - [ ] Scan results screens
  - [ ] Info / About sections
  - [ ] Terms of Service
  - [ ] Privacy Policy

- [ ] OCR accuracy limitations:
  - [ ] Clear disclaimer on scan results screen
  - [ ] User verification prompt before saving prescriptions
  - [ ] Option to manually correct extracted information
  - [ ] Text indicating "Always verify with original prescription"

### Data Safety & Privacy

- [ ] Privacy Policy implementation:
  - [ ] Accessible from app settings/info
  - [ ] Linked in Play Store listing
  - [ ] Includes all required GDPR/CCPA elements
  - [ ] Discloses all data collected and processing methods
  - [ ] Describes how users can export/delete their data
  - [ ] Contact information for privacy inquiries

- [ ] Data collection transparency:
  - [ ] Permissions requested match actual app functionality
  - [ ] Purpose explanation shown during permission requests
  - [ ] Data Safety section in Play Store listing accurately completed
  - [ ] User can opt out of optional data collection

- [ ] Technical implementation:
  - [ ] Database RLS policies properly configured
  - [ ] Encryption for data at rest implemented
  - [ ] TLS for data in transit configured
  - [ ] Authentication mechanisms secure
  - [ ] Data deletion functionality tested
  - [ ] Data export functionality tested

### Payment Integration

- [ ] Payment clarity:
  - [ ] Clear indication that payments are for scan credits only
  - [ ] No suggestion of payment for medical services
  - [ ] Prices clearly displayed before purchase
  - [ ] Terms of purchase accessible before payment

- [ ] Technical compliance:
  - [ ] Google Play billing used for in-app purchases
  - [ ] No hardcoded payment references in app
  - [ ] PayU webhook implementation secure
  - [ ] Duplicate transaction protection working

### UI/UX Compliance

- [ ] Accessibility:
  - [ ] Minimum touch target size (44×44dp) on all interactive elements
  - [ ] Screen reader compatibility tested
  - [ ] Color contrast meets WCAG AA standards
  - [ ] Dynamic text size support implemented

- [ ] Disclaimers & legal:
  - [ ] Disclaimers not obscured by UI elements
  - [ ] Legal text has sufficient contrast in both themes
  - [ ] Required user agreements are clearly presented
  - [ ] Version tracking for legal text changes

## Final Technical Review

### Code & App Quality

- [ ] No debug code in production build:
  - [ ] Test buttons/features removed
  - [ ] Debug logs disabled
  - [ ] Test accounts removed
  - [ ] Analytics properly configured for production

- [ ] Error handling:
  - [ ] User-facing error messages are helpful and non-technical
  - [ ] Graceful handling of network failures
  - [ ] No exposed stack traces or technical details
  - [ ] Proper logging for troubleshooting

- [ ] Performance:
  - [ ] App responsive on low-end devices
  - [ ] Memory usage optimized, especially for scan processing
  - [ ] Battery usage reasonable during normal operation
  - [ ] Cold start time acceptable

### Security

- [ ] Authentication:
  - [ ] Token storage is secure
  - [ ] Session management handles timeouts properly
  - [ ] Account recovery process secure
  - [ ] No sensitive data in logs or analytics

- [ ] Network security:
  - [ ] Certificate pinning or proper TLS validation
  - [ ] No insecure HTTP connections
  - [ ] API endpoints properly secured
  - [ ] Webhooks validate signatures

### Build & Versioning

- [ ] Version management:
  - [ ] App versionCode incremented in app.json
  - [ ] Version naming follows semantic versioning
  - [ ] Release notes prepared
  - [ ] Git tag created for release version

- [ ] Build configuration:
  - [ ] Production API endpoints used
  - [ ] Proper signing key used
  - [ ] ProGuard/R8 enabled with appropriate rules
  - [ ] App Bundle created instead of APK

## Play Store Listing

### Content & Assets

- [ ] Store listing:
  - [ ] Screenshots show app with disclaimers visible
  - [ ] Feature graphic includes non-medical disclaimer
  - [ ] Description explicitly states organizational purpose
  - [ ] Keywords avoid medical claims

- [ ] Store metadata:
  - [ ] Category set to "Health & Fitness"
  - [ ] Content rating questionnaire accurately completed
  - [ ] App access rights accurately described
  - [ ] Contact information up to date

### Compliance Sections

- [ ] Data Safety:
  - [ ] All collected data types declared
  - [ ] Encryption practices accurately described
  - [ ] Data sharing practices truthfully disclosed
  - [ ] User rights and controls accurately described

- [ ] Target audience:
  - [ ] Target age group set properly (18+)
  - [ ] Content appropriate for specified audience
  - [ ] No targeting of children under 13

## Post-Submission Plan

### Monitoring

- [ ] Play Console monitoring set up:
  - [ ] Crash reporting alerts configured
  - [ ] ANR alerts configured
  - [ ] Review notifications enabled
  - [ ] Compliance issue alerts prioritized

- [ ] Response plan:
  - [ ] Team member assigned to monitor Play Console daily
  - [ ] Process for addressing urgent compliance issues
  - [ ] Timeline for responding to review comments
  - [ ] Staging environment ready for testing fixes

### Documentation

- [ ] Compliance records:
  - [ ] Screenshots of all compliance elements saved
  - [ ] Documentation of technical compliance measures
  - [ ] Record of testing procedures for compliance features
  - [ ] Contact information for compliance inquiries up to date

## Final Verification

- [ ] Testing:
  - [ ] App tested on physical low-end device
  - [ ] App tested on physical high-end device
  - [ ] All core user flows verified on production build
  - [ ] In-app purchases tested with test accounts

- [ ] Legal review:
  - [ ] All disclaimers reviewed for accuracy
  - [ ] Privacy Policy reviewed for compliance
  - [ ] Terms of Service reviewed for clarity
  - [ ] All legal documents have consistent information 