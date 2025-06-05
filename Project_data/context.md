Prescription_AI\
├── .cursor
│   └── rules
│       └── prescription-rules.mdc
├── .github
│   └── workflows
│       ├── expo-build.yml
│       └── static.yml
├── app
│   ├── (auth)
│   ├── (tabs)
│   │   ├── info
│   │   │   ├── _layout.tsx
│   │   │   ├── about.tsx
│   │   │   ├── contact.tsx
│   │   │   ├── index.tsx
│   │   │   ├── medical-disclaimer.tsx
│   │   │   ├── privacy-policy.tsx
│   │   │   └── terms-of-service.tsx
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── ProfileScreen.tsx
│   ├── screens
│   │   ├── CameraScreen.tsx
│   │   ├── CreateNewPasswordScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── PriceChartScreen.tsx
│   │   ├── PrivacyPolicyScreen.tsx
│   │   ├── ProcessingResultScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── SubscriptionScreen.tsx
│   │   ├── TermsOfServiceScreen.tsx
│   │   └── VerifyOTPScreen.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── index.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── tos.tsx
├── assets
│   ├── fonts
│   │   └── SpaceMono-Regular.ttf
│   ├── images
│   └── loading_animation.json
├── components
│   ├── __tests__
│   │   ├── __snapshots__
│   │   │   └── ThemedText-test.tsx.snap
│   │   └── ThemedText-test.tsx
│   ├── LoadingScreen
│   │   ├── LoadingScreen.native.tsx
│   │   └── LoadingScreen.web.tsx
│   ├── ui
│   │   ├── AppStatusBar.tsx
│   │   ├── BackHandlerWithExit.tsx
│   │   ├── DisclaimerComponent.tsx
│   │   ├── IconSymbol.ios.tsx
│   │   ├── IconSymbol.tsx
│   │   ├── NotificationIcon.tsx
│   │   ├── NotificationPopup.tsx
│   │   ├── ScanInstructions.tsx
│   │   ├── TabBarBackground.ios.tsx
│   │   ├── TabBarBackground.tsx
│   │   └── VerificationPrompt.tsx
│   ├── utils
│   │   ├── errorHandler.ts
│   │   └── scanUtils.ts
│   ├── AuthContext.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── GoogleAuthService.ts
│   ├── GradientText.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── NotificationContext.tsx
│   ├── NotificationService.ts
│   ├── NotificationTestUtils.ts
│   ├── ParallaxScrollView.tsx
│   ├── prescriptionService.ts
│   ├── ProtectedRoute.tsx
│   ├── QuotaBadge.tsx
│   ├── storageService.ts
│   ├── supabaseClient.ts
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants
│   ├── Colors.ts
│   └── ThemeConfig.ts
├── docs
│   ├── architecture_guide.md
│   ├── data_models.md
│   ├── database_schema.md
│   ├── fix_build.md
│   ├── functions_documentation.md
│   ├── payu_integration.md
│   ├── privacy_policy.md
│   ├── secrets_documentation.md
│   ├── setup_guide.md
│   ├── ui_documentation.md
│   └── variables_documentation.md
├── eas-hooks
│   └── disable-auto-submit.js
├── gcloud
├── hooks
│   ├── useAuth.tsx
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── scripts
│   ├── custom-build.js
│   ├── reset-project.js
│   └── taskmaster.js
├── supabase
│   ├── functions
│   │   ├── create-payu-button
│   │   │   └── index.ts
│   │   └── payu-webhook
│   │       ├── .npmrc
│   │       ├── deno.json
│   │       └── index.ts
│   ├── migrations
│   ├── templates
│   │   └── confirmation.html
│   └── config.toml
├── Taskmaster
│   ├── reports
│   ├── templates
│   │   └── basic_task.json
│   ├── cli.js
│   ├── completed.json
│   ├── package-lock.json
│   ├── package.json
│   ├── project-analyzer.js
│   ├── README.md
│   ├── taskmaster.js
│   └── tasks.json
├── templates
│   └── confirmation.html
├── vsix
├── .gitignore
├── app.config.js
├── app.json
├── APP_DOCUMENTATION.md
├── cursor-ai-rules.txt
├── database_setup_guide.md
├── delete-account.html
├── eas.json
├── EMAIL_OTP_VERIFICATION.md
├── google-services.json
├── GOOGLE_SSO_FIX.md
├── GOOGLE_SSO_FIX_UPDATED.md
├── GOOGLE_SSO_SETUP.md
├── package-lock.json
├── package.json
├── privacy-policy.html
├── README-EMAIL-TEMPLATES.md
├── README.md
├── rebuild-dev-client.bat
├── supabase-email-template-instructions.md
├── taskmaster-minified.md
├── taskmaster-rules.md
├── template-update-instructions.txt
├── tsconfig.json
├── update-email-templates-fixed.js
├── update-email-templates-test.js
├── update-email-templates.js
├── update-templates-cli.ps1
└── update-templates-cli.sh

<file path=".cursor/rules/prescription-rules.mdc">
---
description: 
globs: 
alwaysApply: true
---
Always:
  - Use global context (`useAuth()`) for user scan quota (`scansRemaining`, `refreshScansRemaining`).
  - Do not use local state for scan quota unless for optimistic UI updates.
  - After any action that changes quota (scan, payment, coupon), call `refreshScansRemaining()`.
  - After any scan attempt (success or failure), always call `refreshScansRemaining()` to ensure UI matches backend quota.
  - When a scan is processed, optimistically decrement the quota in the UI until the next refresh using a local `optimisticScans` state if needed.
  - If `scansRemaining` (or `optimisticScans`) is 0 or less, block scan actions and redirect user to the subscription page. Show an alert explaining the quota is exhausted and offer a button to purchase more scans.
  - If the backend (e.g., via RPC) reports no scans remaining but the UI shows scans left, show a clear alert that the quota is out of sync and suggest refreshing or contacting support.
  - Only check and block quota (with alert and redirect) when the user presses the scan or upload button, not on page load or passive navigation.
  - Ensure this logic is present in all user-initiated scan/upload actions.
  - All API/network/database errors must be caught and shown to the user via `Alert.alert` or a visible UI message. Log errors to the console for debugging.
  - Use the same badge and display style for scan quota across all screens. Always show the latest quota value from context.
  - For any logic that updates quota, add a comment: `// Updates scan quota using global context`.
  - For any payment/coupon logic, add a comment: `// Payment or coupon logic, refreshes scan quota`.
  - After a successful scan or payment, always refresh quota and navigate as appropriate (e.g., to home or subscription page).
  - Always execute database queries if necessarily required, at the time of operation using given supabase MCP server.
  - Place all rules and automation guidelines in `cursor-ai-rules.txt` in the project root.
  - For PayU payment integration:
    - Display the payment button in a WebView modal and handle deep link redirects after payment completion.
    - Use a single webhook endpoint (no query params needed) for both success and failure callbacks from PayU (e.g., https://<project>.supabase.co/functions/v1/payu-webhook).
    - Only update scan quota after a successful webhook call from PayU (never credit scans directly from the app after UI payment success).
    - Always verify the transaction hasn't been processed already by checking the transaction_id in the payment_transactions table. This must be enforced in the webhook code before crediting scans, not just via DB constraints. If a duplicate is detected, do not credit scans again and respond with a message indicating the transaction was already processed.
    - If payments succeed but scans are not credited, always check PayU dashboard webhook/callback logs for delivery attempts and errors.
    - The webhook endpoint must be publicly reachable from PayU's servers; test with both manual POSTs and real PayU transactions.
    - The app should only reflect scan quota changes after backend confirmation via webhook, not just after payment UI success.
    - PayU sends data in URL-encoded form format, not JSON. Webhook must handle both formats for compatibility with testing and real PayU transactions.
    - Always set a minimum scan quota (at least 1) for small test payment amounts (e.g., 1 INR).
    - Process URL-encoded emails with decodeURIComponent and use case-insensitive matching (ilike) when looking up users.
    - Transactions with 0 scan_quota should be updated rather than rejected as "already processed" - this handles multi-stage webhooks from PayU.
    - In the WebView payment flow, don't rely solely on navigation state changes to detect payment success or failure. These can be triggered by intermediate redirects from the payment gateway.
    - When implementing payment detection, check for specific success/failure URLs or parameters that clearly indicate the final payment status.
    - Include a manual close/back button in the WebView payment UI to allow users to exit if the automatic detection fails.
    - Consider using a timeout mechanism that automatically closes the payment WebView if no definitive success/failure state is detected within a reasonable time period.
    - Log all navigation state changes during payment processing for debugging purposes, with clear markers for start, intermediate states, and final outcome.
    - Implement proper loading states during payment processing to prevent multiple payment attempts by the user.
    - The webhook endpoint must carefully validate all incoming data and signatures before processing payments to prevent fraud.
    - Never remove existing payment links when updating to new ones; instead, store all payment links in a constants object (like PAYMENT_URLS) with clear labels for production vs. test links. This allows for easy testing and ensures backward compatibility with existing payment flows when needed.
  - Refactor any code duplication detected by Taskmaster (see tasks with category 'Duplication'). Extract repeated logic into reusable functions or components.
  - Move all hardcoded URLs or API endpoints to a configuration file or constants module. Reference these in code instead of inline strings. (See tasks with category 'Optimization')
  - For any refactoring or optimization, reference the relevant Taskmaster task ID in your commit message (e.g., 'Refactor: extract duplicate logic [task-xxx]').
  - Track all major refactoring, optimization, and technical debt tasks in Taskmaster and keep their status updated.
  - (Recommended) Refresh scan quota on app resume or when the app comes to the foreground to avoid stale UI.
  - If a user reports a repetitive or frustrating issue, always update the rules to encode the fix and prevent recurrence. Encode our conversational experience as rules for any repetitive tasks.
  - The AI assistant must always autonomously perform all code and rule updates required to fix the user's problem, without instructing the user to update or execute code themselves. Only provide next steps for the user to implement in the app after performing all possible automated actions.
  - Whenever any rules are updated, both cursor-ai-rules.txt and .cursor/rules/prescription-rules.mdc must be updated simultaneously to keep them in sync. This ensures consistency between the main rules file and the MDC rules file.
  - When testing webhook endpoints on Windows/PowerShell, use Invoke-WebRequest instead of Unix-style curl flags. Example:
    Invoke-WebRequest -Uri "<url>" -Method POST -Body '{...}' -ContentType "application/json"
    Use backticks for line continuation or put the command on one line. The -Body parameter must be a string (for JSON).
  - If you have Git Bash or WSL, you can use classic curl commands as in Unix/Linux.
  - For Supabase Edge Functions that must be accessible to external webhooks (e.g., PayU), set verify_jwt = false in supabase/config.toml for the relevant function. This allows unauthenticated POSTs from third-party services.
  - After changing function config (e.g., verify_jwt), always redeploy the function using: supabase functions deploy <function-name>
  - Supabase CLI requires Docker Desktop to be installed and running for Edge Function deployment. If deployment fails with a Docker error, start Docker Desktop and retry.
  - For deploying Supabase Edge Functions via CLI:
    - Use `supabase functions new <function-name>` to create a new function.
    - Use `supabase functions deploy <function-name>` to deploy a function.
    - Use `supabase functions list` to view all deployed functions.
    - Use `supabase functions delete <function-name>` to remove a function.
    - For local development and testing, use `supabase start` and `supabase functions serve <function-name>`.
    - When updating existing functions, always check for changes in input/output parameters that might break existing clients.
    - Include proper error handling and CORS configuration in all functions.
    - Use TypeScript types from "jsr:@supabase/functions-js/edge-runtime.d.ts" for better type safety.
  - After redeploying, always test the endpoint with a manual POST (using PowerShell or curl) to confirm it is reachable and does not return 401 Unauthorized. Only then should you expect third-party webhooks to work.
  - The AI assistant is capable of running any required commands directly in the environment and should do so autonomously when needed, rather than instructing the user to run them.
  - The MCP Supabase get_logs tool has limitations and cannot reliably fetch Edge Function logs. When troubleshooting Edge Functions, always ask the user to provide the logs from the Supabase dashboard or through manual testing. This is especially important for PayU webhook troubleshooting.
  - When making layout changes, always test on both Android and iOS to ensure no elements are blocked by system UI overlays.
  - All rules and automation guidelines must be kept in sync between cursor-ai-rules.txt and .cursor/rules/prescription-rules.mdc.


# Additional rules learned from recent lessons:
- Always ensure UI elements (especially header buttons) are not blocked by system overlays. For Android, add sufficient top padding to account for the status bar (use StatusBar.currentHeight).
- Never leave debug or test code in production. Remove all debug/test buttons, global debug functions, test logs, and temporary test logic before release.
- Only keep essential UI elements in production builds. All test and debug UI must be removed.
- Always use global context (useAuth) for scan quota management and never use local state for quota except for optimistic UI updates.
- When adding new UI elements, ensure minimum touch target size (at least 44x44px) for accessibility and usability.
- When adding a refresh button for quota, always use the global refreshScansRemaining function and ensure it updates the UI from the backend.
- When making layout changes, always test on both Android and iOS to ensure no elements are blocked by system UI overlays.
- All rules and automation guidelines must be kept in sync between cursor-ai-rules.txt and .cursor/rules/prescription-rules.mdc.
- When using StatusBar, prefer non-translucent (translucent={false}) for main screens to avoid layout issues and unexpected spacing at the top.
- Avoid duplicate UI components, especially headers or status bars, that can create unnecessary whitespace or visual inconsistencies.
- When fixing layout issues, first check for duplicate components, status bar configurations, and padding/margin values.
- Preserve original screen layouts when making unrelated changes to prevent unintended UI regressions.
- Never modify tab navigation layouts unnecessarily as it can affect all screens.
- For multi-platform layouts, use Platform.OS to provide platform-specific values rather than one-size-fits-all approaches.
- When adjusting StatusBar components, check how it affects neighboring screens and tab navigation.
- For screens with overlapping headers or gradients, ensure z-index values are properly set to prevent visual artifacts.
- Keep UI element measurements consistent across all screens (e.g., don't use different button sizes for the same action on different screens).
- When refactoring status bar handling, consider moving that logic to a consistent place like navigation configuration rather than individual screens.
- When using custom components like AppStatusBar, ensure they're only added to screens that need them to avoid layout inconsistencies.
- Always configure Supabase client with AsyncStorage in React Native for persistent sessions by adding auth options with storage, autoRefreshToken, persistSession (all true), and detectSessionInUrl (false). Also ensure the AsyncStorage package is properly installed and linked.
- After making changes to authentication or session management, always test by closing and reopening the app to verify persistent login works correctly.
- For module errors like "NativeModule: AsyncStorage is null", always ensure the package is properly installed using "expo install" with the exact version required by your Expo SDK.
- When adding or updating native dependencies like AsyncStorage, a full rebuild is required: 1) stop the current server, 2) run `npx expo prebuild --clean` to clean native code, and 3) run `npx expo run:android` (or ios) to rebuild the app with the new native modules. Simply restarting the dev server is not sufficient.
- If experiencing "Missing the required default export" errors with Expo Router even when the export is present, check if the file is being correctly recognized - this can be a false positive during development that requires a full rebuild to resolve.
- On Windows, be aware of path length limitations (maximum 260 characters) when building React Native projects. Long project paths can cause build failures, especially with nested node_modules. Consider: 1) Moving the project to a shorter path (e.g., C:\RxAI instead of C:\Users\username\Documents\Projects\etc), 2) Using EAS Build for cloud building which avoids local path issues, or 3) Enabling long path support in Windows.
- When local builds fail due to environment issues, use EAS Build (`eas build --platform android --profile development`) as a reliable alternative that provides a consistent build environment and avoids local configuration problems.
- Always maintain an eas.json configuration file for cloud builds with appropriate profiles (development, preview, production) to facilitate quick building without local environment issues.
- Test authentication persistence by fully closing the app (not just minimizing) and reopening it, as this is the only reliable way to verify session storage is working correctly.
- When making native code changes, understand the distinction between JavaScript-only changes (which only require Metro server restart) and native module changes (which require full app rebuild). Native module changes include adding/updating native dependencies, linking native modules, or modifying native code files.
- Use the Development Client (`npx expo start --dev-client`) instead of Expo Go when working with custom native modules. Expo Go only supports a limited set of pre-bundled native modules.
- After adding a new native dependency, always run `npx expo prebuild` to generate or update the native project files before building with `npx expo run:android` or `npx expo run:ios`.
- For consistent development across team members, document all native dependencies in a separate section of README.md including installation steps, required configuration, and potential platform-specific issues.
- When you encounter the error "NativeModule X is null", it indicates a native module wasn't properly linked. The complete solution requires: 1) ensure the package is properly installed, 2) run prebuild to update native files, and 3) perform a full rebuild of the app.
- Metro bundler (`npx expo start`) only handles JavaScript changes. It cannot detect or apply native code changes. Always rebuild the app after any native code modifications.
- Never mix Expo managed workflow and bare workflow concepts - if using custom native modules, commit to using the development client or EAS builds and avoid trying to use Expo Go.

# Google Play Store Compliance Rules:
- Include clear health disclaimers that the app is not intended for medical use, not a medical device, and designed for general organization purposes in all app metadata and relevant UI screens.
- Ensure the privacy policy explicitly discloses what prescription data is collected, how it's processed and stored, who can access it, and what security measures are in place.
- For AI/OCR features, always disclose accuracy limitations and include prompts for users to verify all extracted information.
- Never make medical claims about medications scanned or suggest medical advice - include disclaimers to consult healthcare professionals.
- Ensure all payment features clearly indicate they are for scan quota credits only, not for clinical services.
- Include appropriate disclaimers on scan result screens stating that information may not be 100% accurate and should be verified.
- Add UI elements that prompt users to verify all prescription information after scans complete.
- Never store sensitive medical information without proper encryption and security measures.
- When displaying medication information, include a disclaimer that it's for informational purposes only and not medical advice.
- In all marketing materials and store listings, avoid claims that could be interpreted as offering medical services or advice.

# Legal and Privacy Compliance Rules
- All legal documents (Terms of Service, Privacy Policy) must specify India as the governing jurisdiction.
- Include GDPR (EU) and CCPA (California) compliance sections in Privacy Policy.
- Include clear medical and AI disclaimers at both start and end of legal documents.
- Ensure all user-facing legal text has proper styling with theme-aware colors.
- Add DisclaimerComponent for both medical and AI disclaimers in legal pages.
- Maintain consistent section numbering across legal documents.
- Keep "Last Updated" dates in sync across all legal documents.
- Include contact information (contact@autoomstudio.com) consistently across all legal documents.

# Data Handling Rules
- Implement secure data storage with encryption both in transit and at rest.
- Include clear data retention and deletion policies.
- Document all data processing activities, especially AI/OCR processing.
- Maintain clear separation between medical data and user account data.
- Implement data portability mechanisms for GDPR compliance.
- Never store unencrypted prescription data, even temporarily.
- Log all data access and processing activities for audit purposes.

# UI/UX Rules for Legal Content
- Use ScrollView with proper padding for legal content.
- Implement consistent styling for legal text (font sizes, line heights, margins).
- Use theme-aware colors for all text elements.
- Include clear section headers and subsection titles.
- Maintain proper spacing between sections (24px margin).
- Ensure footer text is clearly visible and properly styled.
- Add proper padding at the bottom of scrollable content.

# Document Maintenance Rules
- Review and update legal documents at least quarterly.
- Maintain version history of all legal documents.
- Document all changes to legal text in commit messages.
- Keep all contact information up to date across documents.
- Ensure consistent formatting across all legal documents.
- Review and update disclaimers regularly based on app features.
- Sync updates between Terms of Service and Privacy Policy.

# Compliance Testing Rules
- Test all legal document links and contact information.
- Verify proper display of legal text in both light and dark themes.
- Test scrolling behavior on various screen sizes.
- Ensure proper rendering of special characters and formatting.
- Test accessibility of legal content (font sizes, contrast).
- Verify proper loading of DisclaimerComponent in all contexts.
- Test proper handling of user data deletion requests.

# Additional rules learned from recent lessons:
- Always include both medical and AI disclaimers using DisclaimerComponent.
- Ensure consistent section numbering (fix duplicate section 8 issue).
- Keep all legal documents in sync with the same Last Updated date.
- Use theme-aware colors for all text elements consistently.
- Include clear contact information in a consistent format.
- Maintain proper ScrollView padding and content container styling.
- Follow consistent styling patterns across all legal documents.
- Include clear data handling and processing explanations.
- Document all third-party service providers and data processors.
- Include specific details about AI/OCR processing limitations.
- Add clear explanations of user rights and how to exercise them.
- Maintain consistent formatting for bullet points and lists.
- Include clear explanations of payment processing and refunds.
- Document all data retention periods and deletion procedures.
- Keep all jurisdiction-specific sections (India, EU, California) up to date.
- Include clear explanations of international data transfers.
- Document all security measures and encryption practices.
- Maintain consistent styling for headers, paragraphs, and footers.
- Include clear explanations of user responsibilities.
- Document all app limitations and disclaimers consistently.

# Navigation and Screen Management Rules
- Always implement proper back button handling in every screen using `useFocusEffect` and `BackHandler`.
- For Android, override the hardware back button behavior using:
  ```typescript
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Custom back logic here
        return true; // Prevents default behavior
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  ```
- Never rely on the default back button behavior for critical flows (payment, scan, upload).
- Always clean up navigation listeners in the cleanup function of useEffect/useFocusEffect.
- Implement consistent navigation behavior across both Android and iOS.
- For WebView screens (especially payment flows):
  - Add custom back button handling to prevent accidental exits
  - Show confirmation dialog before allowing navigation away from critical processes
  - Handle both hardware back button (Android) and gesture-based navigation (iOS)
- When navigating after critical operations (payment, scan):
  - Clear navigation history to prevent back navigation to sensitive screens
  - Use `navigation.reset()` instead of `navigation.navigate()` when appropriate
  - Ensure proper state cleanup before navigation
- For modal screens:
  - Add proper close button in the header
  - Handle both swipe-to-dismiss and back button consistently
  - Show confirmation dialog before dismissing if there are unsaved changes
- Maintain consistent header styling and navigation options across all screens
- Always handle navigation edge cases:
  - Deep linking
  - Background to foreground transitions
  - Screen rotation
  - Low memory conditions
- For payment flows:
  - Prevent multiple navigation attempts during processing
  - Handle timeout scenarios with proper user feedback
  - Provide clear exit paths for failed transactions
- Log all critical navigation events for debugging purposes
- Test navigation flows on both platforms with various user interaction patterns

# Info Tab Navigation Rules
- For Info tab child pages (Terms of Service, Privacy Policy, etc.):
  - Use Stack Navigator with custom header configuration for consistent back button behavior
  - Implement custom header left button using `headerLeft` prop in navigation options
  - Use theme-aware colors for header elements (text, icons, background)
  - Add proper padding to account for system status bar on Android
  - Example header configuration:
    ```typescript
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 16, padding: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerTitle: "Page Title",
      headerTitleStyle: { color: colors.text },
      headerStyle: { 
        backgroundColor: colors.background,
        elevation: 0,
        shadowOpacity: 0
      }
    });
    ```
  - Ensure consistent header styling across all info pages:
    - Remove header border/shadow (elevation: 0, shadowOpacity: 0)
    - Use consistent padding and touch targets (minimum 44x44px)
    - Maintain uniform header height and element spacing
  - For scrollable content:
    - Use ScrollView with proper contentContainerStyle
    - Add bottom padding to account for safe area
    - Handle keyboard avoidance if needed
  - For system back gestures (iOS) and hardware back button (Android):
    - Allow default back behavior for info pages as they don't contain unsaved changes
    - No need for confirmation dialogs when leaving info pages
    - Ensure smooth transition animations
  - When navigating to info pages:
    - Use `navigation.navigate()` instead of `push` to prevent stack buildup
    - Clear any irrelevant navigation params
    - Reset scroll position to top

# AI Change Scope Limitation Rule
- The AI must not change any functionality, layout, design, function, or feature unless explicitly requested by the user.
- If the user requests a change, only the specific part(s) mentioned by the user should be modified.
- The AI must not add, remove, or alter any other code, UI, or logic beyond what is directly specified by the user request.
- No autonomous or speculative changes are allowed outside the user's explicit instructions.

# Git and Version Control Rules
- Always create descriptive commit messages with a format of: `[Component/Feature]: Brief description of changes`. For example, `[Auth]: Fix session persistence with AsyncStorage`.
- Include the Taskmaster task ID in commits when implementing tracked tasks: `[Auth]: Fix session persistence with AsyncStorage [task-123]`.
- Create separate branches for major features and fixes using a naming pattern: `feature/feature-name` or `fix/issue-description`.
- Never commit directly to the main/master branch for production code - always use pull requests with appropriate reviews.
- Before pushing changes, run `git pull --rebase` to incorporate any remote changes and maintain a cleaner commit history.
- When resolving merge conflicts, consult with the original author of the conflicting code when possible, especially for complex logic.
- Add proper `.gitignore` entries for all environment-specific files, build artifacts, and sensitive information.
- Never commit API keys, passwords, or other secrets. Use environment variables or secure storage solutions.
- Tag important releases with semantic versioning (`v1.0.0`, `v1.1.0`, etc.) and include release notes in the tag description.
- When making changes across multiple files that comprise a single feature or fix, commit them together to maintain atomic commits.
- Regularly push changes to remote repositories to ensure work isn't lost and team members can see progress.
- For native code changes, include build instructions or notes in the commit message to help other developers understand any required rebuild steps.
- Include the Android/iOS compatibility impact in commit messages when making platform-specific changes.
- When fixing build process issues, document the problem and solution in both commit messages and project documentation.
- Clean up local branches after they've been merged to keep the repository organized.
- When collaborating on a feature, use clear PR descriptions that reference design documents, specifications, or Taskmaster tasks.
- Perform partial commits using `git add -p` for large changes to create logical, reviewable commit units.

# Restart and Rebuild Guidelines
- Always prompt the user explicitly if they need to restart services/emulators/servers or rebuild the app/development client after changes.
- For JavaScript/TypeScript file changes only (no native modules added):
  - Restart Metro server with `npx expo start` to apply the changes
  - No need to restart the emulator/device or rebuild the development client
- For changes to React Native configuration (metro.config.js, app.json, etc.):
  - Restart Metro server with `npx expo start --clear` to clear the cache
  - No need to rebuild the development client
- For adding or updating native modules (e.g., native dependencies in package.json):
  - Stop Metro server
  - Run `npx expo prebuild --clean` to clean native code
  - Run `npx expo run:android` or `npx expo run:ios` to rebuild the app with new native modules
  - Simply restarting Metro server is not sufficient for native module changes
- For changes to Supabase Edge Functions:
  - Deploy the function using `supabase functions deploy <function-name>`
  - No need to restart Metro server or rebuild the app
- For database schema changes (migrations):
  - Apply the migration using Supabase MCP tools or manually via SQL
  - No need to restart Metro server or rebuild the app
- When installing non-native npm packages:
  - Run `npm install <package-name>`
  - Restart Metro server with `npx expo start`
  - No need to rebuild the development client
- When changes involve complex state management (e.g., context providers):
  - Restart Metro server to ensure clean state
  - Use `npx expo start --clear` to clear cache if state issues persist
- When modifying environment variables (.env files):
  - Restart Metro server to apply the changes
  - If environment variables are used in native modules, a full rebuild may be necessary
- After updating app icons or splash screens:
  - A full rebuild is required: `npx expo prebuild` followed by `npx expo run:android/ios`
- After updating app configuration (app.json):
  - Run `npx expo prebuild` to regenerate native code based on new configuration
  - Run `npx expo run:android/ios` to rebuild with new configuration
- Always specify exact commands the user should run for any restart or rebuild process
- For any UI changes, explicitly state whether the changes require:
  - Just a hot reload (automatic)
  - Metro server restart
  - Full app rebuild
- After major dependencies version changes (React Native, Expo SDK, etc.), always recommend:
  - Clear node_modules: `rm -rf node_modules`
  - Clear Metro cache: `npx expo start --clear`
  - Reinstall dependencies: `npm install`
  - Rebuild native code: `npx expo prebuild --clean` and `npx expo run:android/ios`

# Notification System Rules
- Always use a global context (NotificationContext) to manage notification state across the app.
- Fetch notifications on app startup and when the app comes to foreground.
- Implement optimistic UI updates for notification read status.
- Cache notifications locally to reduce database load and improve offline experience.
- Ensure notification badges accurately reflect the unread count from the global context.
- For notification popups:
  - Make them dismissible with proper animation
  - Provide clear visual distinction between read and unread items
  - Include timestamps with human-readable format (e.g., "2 hours ago")
  - Add pull-to-refresh functionality for easy manual refresh
  - Include infinite scroll or pagination for older notifications
- Notifications related to critical app functions (quota depletion, payment confirmation, etc.) should be stored in the database, not just displayed as alerts.
- All server-generated notifications (low quota, payment processed) should use database triggers instead of client-side generation.
- When a notification is related to a specific section of the app (e.g., scan quota), tapping it should navigate to the relevant screen.
- Clear all notifications option should have a confirmation dialog to prevent accidental deletion.
- After navigating from a notification, mark it as read automatically.
- Include proper error handling if notification operations (fetch, mark as read) fail.
- Allow notification filtering by type for better user experience.
- Log all notification-related errors for debugging.
- All notification UI elements should be accessible and have proper contrast ratios.
- Test all notification flows on both platforms (Android and iOS) for consistent behavior.
- Notification database operations should use RLS policies for security.
- In production, remove all test notification generation features.

# Navigation and Stack Management Rules
- For tabbed navigation (e.g., Info tab), always use `router.replace` when navigating from the tab root to a child page if you want to prevent stack buildup. Never use `router.push` or `<Link>` in these cases.
- Centralize all back navigation logic (hardware and header) in the layout or navigator component for a tab, not in individual child pages.
- Never mix `push` and `replace` for the same navigation flow. Choose one and enforce it for all related screens.
- After any navigation refactor, test by repeatedly navigating between tab root and child pages, and using back navigation, to ensure no stack buildup or navigation anomalies occur.
- Document the intended navigation pattern for each tab and its children in the project rules and keep this documentation up to date.

# End of Cursor AI Editor Rules

# Project Structure
#
# The project is organized as follows:
#
# app/
#   (tabs)/
#     info/
#       about.tsx
#       contact.tsx
#       medical-disclaimer.tsx
#       privacy-policy.tsx
#       terms-of-service.tsx
#       index.tsx
#       _layout.tsx
#     index.tsx
#     _layout.tsx
#     ProfileScreen.tsx
#   screens/
#     TermsOfServiceScreen.tsx
#     PrivacyPolicyScreen.tsx
#     ProcessingResultScreen.tsx
#     CameraScreen.tsx
#     SubscriptionScreen.tsx
#     VerifyOTPScreen.tsx
#     PriceChartScreen.tsx
#     CreateNewPasswordScreen.tsx
#     ResetPasswordScreen.tsx
#     ForgotPasswordScreen.tsx
#   RegisterScreen.tsx
#   LoginScreen.tsx
#   ForgotPasswordScreen.tsx
#   _layout.tsx
#   index.tsx
#   (auth)/
#   +not-found.tsx
# components/
#   ui/
#   utils/
#   [other components]
# constants/
# hooks/
# docs/
# Taskmaster/

# App Version Display Rule
- Always display the app version in the UI and code using expo-application's nativeApplicationVersion or getApplicationVersion(), never hardcode the version string. This ensures version changes in app.json are reflected everywhere automatically.

</file>
<file path=".github/workflows/expo-build.yml">
name: Expo Build

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build for'
        required: true
        default: 'android'
        type: choice
        options:
          - android
          - ios
          - all

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Login to Expo
        run: echo "${{ secrets.EXPO_TOKEN }}" | eas login --non-interactive

      - name: Build for Android
        if: ${{ github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all' }}
        run: eas build --platform android --profile production --non-interactive --no-wait 
</file>
<file path=".github/workflows/static.yml">
# Simple workflow for deploying static content to GitHub Pages
name: Deploy static content to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Single deploy job since we're just deploying
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload entire repository
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

</file>
<file path="app/(tabs)/info/_layout.tsx">
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useCallback } from 'react';
import { TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

// Custom back button for child screens
function CustomBackButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginLeft: 8, padding: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}

export default function InfoLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Handler to always go to Info main page
  const goToInfoMain = useCallback(() => {
    router.replace('/(tabs)/info');
  }, [router]);

  // Centralized hardware back handler for child pages only
  useFocusEffect(
    useCallback(() => {
      // Only apply on child pages (segments: ['(tabs)', 'info', ...])
      if (segments.length > 2 && segments[0] === '(tabs)' && segments[1] === 'info') {
        const onBackPress = () => {
          router.replace('/(tabs)/info');
          return true;
        };
        if (Platform.OS === 'android') {
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
          return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
      }
      // On index, do not override hardware back
      return;
    }, [router, segments])
  );

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Information',
          headerLeft: () => null, // No back button on main info screen
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="about"
        options={{ title: 'About Us' }}
      />
      <Stack.Screen
        name="medical-disclaimer"
        options={{ title: 'Medical Disclaimer' }}
      />
      <Stack.Screen
        name="contact"
        options={{ title: 'Contact Support' }}
      />
    </Stack>
  );
} 
</file>
<file path="app/(tabs)/info/about.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Application from 'expo-application';

const AboutPage = () => {
  const { colors, dark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={dark ? 
          ['#2A3A64', '#1D2951', '#121836'] : 
          ['#4c669f', '#3b5998', '#192f6a']
        }
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>AI Prescription Saathi</Text>
        <Text style={styles.tagline}>Your personal prescription management assistant</Text>
        <Text style={styles.version}>Version {Application.nativeApplicationVersion || '1.0.0'}</Text>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>About Us</Text> */}
          <Text style={[styles.paragraph, { color: colors.text }]}>
            AI Prescription Saathi is dedicated to helping users better organize and manage their prescription
            information. Our app uses AI technology to extract and organize details from your prescription
            images, making it easier to keep track of your medications and treatments.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We aim to simplify personal health management by providing tools that make prescription 
            information more accessible and organized. Our goal is to help you stay on top of your
            medication schedules, refill dates, and prescription history.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          
          <View style={styles.featureItem}>
            <Feather name="camera" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Prescription Scanning</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Capture prescriptions with your camera for quick digitization
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="file-text" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Text Extraction</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                AI-powered text recognition to extract prescription details
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="list" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Medication Management</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Store and organize all your prescription information
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="cloud" size={24} color={colors.primary || "#4c669f"} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Secure Cloud Storage</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Keep your prescription data safe and accessible
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We'd love to hear from you! For support, feedback, or questions, please contact us at:
          </Text>
          <Text style={[styles.contactEmail, { color: colors.text }]}>
            contact@autoomstudio.com
          </Text>
        </View>

        <Text style={[styles.copyright, { color: colors.text, opacity: 0.6 }]}>© 2025 AI Prescription Saathi. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default AboutPage; 
</file>
<file path="app/(tabs)/info/contact.tsx">
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const ContactPage = () => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSending(true);
    
    // Simulate sending a message
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We will get back to you as soon as possible.',
        [{ text: 'OK', onPress: () => {
          setName('');
          setEmail('');
          setMessage('');
        }}]
      );
    }, 1500);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.contactInfoSection, { backgroundColor: colors.card }]}>
        <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="mail" size={24} color={colors.primary || "#4c669f"} />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text, opacity: 0.7 }]}>Email</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>contact@autoomstudio.com</Text>
          </View>
        </View>
        
        <View style={[styles.contactItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="clock" size={24} color={colors.primary || "#4c669f"} />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text, opacity: 0.7 }]}>Support Hours</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>Monday-Friday: 9am - 5pm IST</Text>
          </View>
        </View>
        
        <View style={styles.contactItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="message-circle" size={24} color={colors.primary || "#4c669f"} />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text, opacity: 0.7 }]}>Response Time</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>Within 24-48 hours</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.formSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Send us a Message</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.text + '80'}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.text + '80'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Message</Text>
          <TextInput
            style={[styles.messageInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help you?"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary || "#4c669f" }]} 
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" style={styles.sendIcon} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={[styles.faqSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        
        <View style={[styles.faqItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>How accurate is the prescription scanning?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text, opacity: 0.8 }]}>
            Our AI technology provides a high level of accuracy, but we recommend always verifying all extracted information with your original prescription.
          </Text>
        </View>
        
        <View style={[styles.faqItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I purchase more scan credits?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text, opacity: 0.8 }]}>
            You can purchase additional scan credits from the Subscription screen, which is accessible from your profile.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>Is my prescription data secure?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text, opacity: 0.8 }]}>
            Yes, we employ industry-standard encryption to protect your data both in transit and at rest. Your data is only accessible to you through your authenticated account.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
  sendButton: {
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqSection: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ContactPage; 
</file>
<file path="app/(tabs)/info/index.tsx">
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import * as Application from 'expo-application';

const InfoScreen = () => {
  const theme = useTheme();
  const router = useRouter();

  // Reset navigation stack when Info tab is focused to ensure it's always treated as a root tab
  useFocusEffect(
    React.useCallback(() => {
      // No need to reset navigation stack or setParams here
      // Do not override hardware back on Info main page
      return;
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Information</Text> */}
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>Legal and app information</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/terms-of-service')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="file-text" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Terms of Service</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Our terms and conditions for using the app</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/privacy-policy')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="lock" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Privacy Policy</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>How we handle and protect your data</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/about')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="info" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>About Us</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Learn more about Prescription AI</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/medical-disclaimer')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="alert-circle" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Medical Disclaimer</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Important health information</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/info/contact')}>
            <Surface style={[styles.menuItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Feather name="mail" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.menuItemTitle, { color: theme.colors.onBackground }]}>Contact Support</Text>
                <Text style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}>Get help with using the app</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </Surface>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfoContainer}>
          <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>Version {Application.nativeApplicationVersion || '1.0.0'}</Text>
          <Text style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>© 2025 Prescription AI. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
  },
});

export default InfoScreen; 
</file>
<file path="app/(tabs)/info/medical-disclaimer.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';

const MedicalDisclaimerPage = () => {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.warningBanner, { backgroundColor: colors.card }]}>
        <Feather name="alert-triangle" size={32} color="#ff6b6b" />
      </View>

      <DisclaimerComponent type="medical" />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Not a Medical Device</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Prescription AI is <Text style={styles.emphasized}>NOT</Text> a medical device and is <Text style={styles.emphasized}>NOT</Text> intended to diagnose, treat, cure, or prevent any disease or health condition.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          This application is designed solely as a personal organization tool to help you keep track of your prescriptions. It does not provide medical advice or recommendations of any kind.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Technology Limitations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The optical character recognition (OCR) and artificial intelligence technologies used in this app have inherent limitations:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            They may not extract or interpret prescription information with 100% accuracy
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Information may be missing, incomplete, or incorrectly interpreted
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="alert-circle" size={16} color="#ff6b6b" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Always verify all extracted information with your original prescription
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Consult Healthcare Professionals</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Always consult qualified healthcare professionals regarding:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Questions about your medications or treatment
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Medication dosage, interactions, or side effects
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Changes to your medication regimen
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="check" size={16} color="#43ea2e" style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            Any health concerns or medical conditions
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>User Responsibility</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using this app, you acknowledge and agree that:
        </Text>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You are solely responsible for verifying the accuracy of all information extracted by the app
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You will never rely on this app as a substitute for professional medical advice
          </Text>
        </View>
        <View style={styles.bulletPoint}>
          <Feather name="user" size={16} color={colors.primary || "#4c669f"} style={styles.bulletIcon} />
          <Text style={[styles.bulletText, { color: colors.text }]}>
            You understand the app is for personal organizational purposes only
          </Text>
        </View>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text, backgroundColor: `${colors.primary}20` }]}>
        If you have any questions or concerns about your medications or health, 
        please contact your doctor, pharmacist, or healthcare provider immediately.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  warningBanner: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  emphasized: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    borderRadius: 8,
  },
});

export default MedicalDisclaimerPage; 
</file>
<file path="app/(tabs)/info/privacy-policy.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';

/**
 * Privacy Policy Page for Info Tab
 */
const PrivacyPolicyPage = () => {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
      
      <DisclaimerComponent type="medical" />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          This Privacy Policy describes how we collect, use, process, and disclose your information, 
          including personal information, in conjunction with your access to and use of the AI Prescription Saathi app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.1 Prescription Data</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Prescription Images: When you scan a prescription, we collect the image you capture.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Extracted Text Data: Our AI technology extracts text information from your prescriptions 
          including medication names, dosages, frequencies, doctor information, and dates.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Metadata: We collect metadata about your prescriptions such as when they were scanned 
          and any tags or notes you add.
        </Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.2 Account Information</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Email address
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Authentication information
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Profile information you choose to provide
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Process and Store Your Data</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Our app processes and stores your data as follows:</Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.1 Data Processing</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Prescription images are processed using optical character recognition (OCR) technology to extract text.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Our AI technology attempts to identify and categorize prescription elements (medications, dosages, etc.).
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Usage patterns are analyzed in an anonymized form to improve our services.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • When you scan a prescription, the extracted information is automatically saved to your account. This automated processing is necessary for providing our service and is done with your consent, which you provide by using the scanning feature.
        </Text>
        
        <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.2 Data Storage</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • All prescription data is encrypted both in transit and at rest using industry-standard encryption protocols.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Data is stored on secure servers hosted by our cloud service provider (Supabase).
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Your prescription data is retained as long as you maintain an active account. You can delete your data at any time through the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Who Can Access Your Data</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • User Access: Your prescription data is only accessible to you through your authenticated account.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Staff Access: Our staff does not have routine access to your personal prescription details.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Third Parties: We do not sell or share your prescription data with third parties for marketing purposes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Security Measures</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We implement comprehensive security measures to protect your personal information:
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Industry-Standard Encryption: All data is encrypted in transit and at rest.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Secure Authentication: We use secure authentication mechanisms to protect your account.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Regular Security Audits: We conduct regular security assessments of our systems.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. AI Processing Limitations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. Users should always verify all extracted information for accuracy. We do not guarantee the accuracy of information extracted from prescriptions, and this app should not be used as a substitute for professional medical advice.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using our scanning feature, you consent to the automatic processing and saving of prescription data. You acknowledge that you are responsible for reviewing all extracted data for accuracy and that the app automatically saves this information to your account after processing.
        </Text>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text }]}>
        By using AI Prescription Saathi, you acknowledge that the app is for personal organizational purposes only, 
        and not for medical diagnosis, treatment decisions, or as a substitute for professional medical advice.
      </Text>
      
      <Text style={[styles.contactInfo, { color: colors.text }]}>
        If you have questions about this Privacy Policy or our data practices, please contact us at:
        contact@autoomstudio.com
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. International Data Transfers</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Your information may be transferred to—and maintained on—servers located outside your country. We take steps to ensure your data is treated securely and in accordance with this Privacy Policy.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Data Retention</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>We retain your data only as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. GDPR Rights (EU Users)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If you are located in the European Economic Area (EEA), you have the right to access, correct, update, or request deletion of your personal information. You may also object to processing, request restriction, or request data portability. To exercise these rights, contact us at contact@autoomstudio.com.</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Our legal basis for processing your data includes your consent, performance of a contract, and compliance with legal obligations.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. CCPA Rights (California Residents)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If you are a California resident, you have the right to request disclosure of the categories and specific pieces of personal information we have collected, request deletion of your personal information, and opt out of the sale of your personal information (we do not sell your data). To exercise these rights, contact us at contact@autoomstudio.com.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>For privacy questions or to exercise your rights, contact: contact@autoomstudio.com</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contactInfo: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  }
});

export default PrivacyPolicyPage; 
</file>
<file path="app/(tabs)/info/terms-of-service.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from '../../../components/ui/DisclaimerComponent';

/**
 * Terms of Service Page for Info Tab
 */
const TermsOfServicePage = () => {
  const { colors } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
      
      <DisclaimerComponent type="medical" />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By accessing or using the AI Prescription Saathi application ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access or use the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          AI Prescription Saathi is a personal organization tool designed to help users digitize and manage their prescription information. The App uses optical character recognition (OCR) and artificial intelligence to extract information from prescription images uploaded by users.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The App is designed for personal organizational purposes only and is NOT intended to provide medical advice, diagnose health conditions, or replace professional healthcare services.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          To use certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information and to update your information to keep it accurate, current, and complete.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Content and Responsibility</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You retain all rights to the prescription images and information you upload to the App. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, process, and store the content solely for the purpose of providing the App's services to you.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You are solely responsible for verifying the accuracy of all information extracted by the App. We do not guarantee 100% accuracy of text extraction or interpretation.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By using the App, you acknowledge and agree that prescription information will be automatically saved after processing. You consent to the automated storage of your prescription data and understand that you should always verify the extracted information for accuracy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Payments and Subscriptions</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The App offers purchase options for scan credits. All payments are processed securely through authorized payment processors. Payments are for scan quota credits only, not for medical services or advice.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          All purchases are processed in compliance with Google Play's billing policy. Refunds are handled according to the platform's refund policy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Medical Disclaimer</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          THE APP IS NOT A MEDICAL DEVICE AND IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE OR HEALTH CONDITION.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The App should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. By using the App, you agree to review all extracted information for accuracy. The App automatically saves prescriptions after processing, and you consent to this data processing and storage with the understanding that you are responsible for verifying all saved information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE APP.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We specifically disclaim liability for any harm, loss, or damage resulting from:
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Inaccuracies in text extraction or interpretation
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Reliance on information extracted by the App
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Unauthorized access to your account or data
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Modifications to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the App and updating the "Last Updated" date.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Your continued use of the App after any changes constitutes your acceptance of the new Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>These Terms are governed by the laws of India, without regard to conflict of law principles.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Dispute Resolution</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>Any disputes arising from these Terms will be resolved through binding arbitration or in the courts of India, unless otherwise required by law.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Severability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>If any provision of these Terms is found to be invalid, the remaining provisions will remain in effect.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>12. Contact</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>For legal questions, contact: contact@autoomstudio.com</Text>
      </View>

      <DisclaimerComponent type="ai" />

      <Text style={[styles.footer, { color: colors.text }]}>
        By using AI Prescription Saathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </Text>
      
      <Text style={[styles.contactInfo, { color: colors.text }]}>
        If you have questions about these Terms, please contact us at:
        contact@autoomstudio.com
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contactInfo: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  }
});

export default TermsOfServicePage; 
</file>
<file path="app/(tabs)/_layout.tsx">
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import BackHandlerWithExit from '@/components/ui/BackHandlerWithExit';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Function to handle tab press and ensure correct navigation behavior
  const handleTabPress = useCallback((route) => {
    if (route === 'info') {
      // Always navigate to the root of the info tab as a replace operation
      router.replace('/(tabs)/info');
      return true; // Return true to indicate we handled it
    }
    return false; // Return false to let default behavior handle it
  }, [router]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4c669f"
        translucent={true}
      />
      <BackHandlerWithExit />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Prescriptions',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="ProfileScreen"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: 'Info',
            tabBarIcon: ({ color }) => <Feather name="info" size={24} color={color} />,
            headerShown: false,
            // Special handler for the info tab
            listeners: {
              tabPress: (e) => {
                // Prevent default behavior
                e.preventDefault();
                // Handle with our custom function
                handleTabPress('info');
              }
            }
          }}
        />
      </Tabs>
    </>
  );
}

</file>
<file path="app/(tabs)/index.tsx">
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Platform, StatusBar, RefreshControl, Modal, ScrollView } from 'react-native';
import { Text, Card, Searchbar, Surface, IconButton, useTheme as usePaperTheme } from 'react-native-paper';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { getPrescriptions, deletePrescription } from '@/components/prescriptionService';
import { useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { getPrescriptionImages, deletePrescriptionImage, getSignedPrescriptionImageUrl } from '@/components/storageService';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from '@/components/supabaseClient';
import NotificationIcon from '@/components/ui/NotificationIcon';
import NotificationPopup from '@/components/ui/NotificationPopup';
import { cameraToApi } from '@/components/utils/scanUtils';
import { showErrorAlert } from '@/components/utils/errorHandler';
import ScanInstructions from '@/components/ui/ScanInstructions';
import { useTheme } from '@react-navigation/native';

interface Prescription {
  id: string;
  doctor_name: string;
  patient_name: string;
  date: string;
  created_at: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

export default function PrescriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [id: string]: string | undefined }>({});
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const router = useRouter();
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);
  const [refreshingQuota, setRefreshingQuota] = useState(false);
  const [notificationPopupVisible, setNotificationPopupVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const { colors, dark } = useTheme();

  // Define gradient colors based on theme with as const for proper typing
  const headerGradientColors = dark 
    ? ["#2A3A64", "#1D2951", "#121836"] as const
    : ["#4c669f", "#3b5998", "#192f6a"] as const;
  
  const actionGradientColors = dark 
    ? ["#3A4C7A", "#2A3A64", "#1D2951"] as const
    : ["#4c669f", "#3b5998", "#192f6a"] as const;
    
  const contentGradientColors = dark 
    ? ["#121212", "#1A1A1A", "#1F1F1F"] as const
    : ["#e0f7fa", "#f5f5f5", "#e3f2fd"] as const;

  const filteredPrescriptions = useMemo(() =>
    prescriptions.filter(p =>
      p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [prescriptions, searchQuery]
  );

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  useEffect(() => {
    // Fetch thumbnails for the filtered prescriptions
    const fetchThumbnails = async () => {
      setThumbnailsLoading(true);
      const newThumbnails: { [id: string]: string | undefined } = {};
      for (const p of filteredPrescriptions) {
        let filePath: string | undefined = undefined;
        if (Array.isArray((p as any).prescription_images) && (p as any).prescription_images.length > 0) {
          filePath = (p as any).prescription_images[0].image_url;
        } else if ((p as any).image_url) {
          filePath = (p as any).image_url;
        }
        if (filePath) {
          const signedUrl = await getSignedPrescriptionImageUrl(filePath, 600); // 10 min expiry for list
          newThumbnails[p.id] = signedUrl || undefined;
        } else {
          newThumbnails[p.id] = undefined;
        }
      }
      setThumbnails(newThumbnails);
      setThumbnailsLoading(false);
    };
    if (filteredPrescriptions.length > 0) {
      fetchThumbnails();
    } else {
      setThumbnails({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPrescriptions]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refreshScansRemaining();
      }
    }, [user])
  );

  useEffect(() => {
    setOptimisticScans(scansRemaining);
  }, [scansRemaining]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const result = await getPrescriptions(user?.id || '');
      if (result.success) {
        setPrescriptions(result.data || []);
      } else {
        console.error('Failed to fetch prescriptions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshScansRemaining();
    fetchPrescriptions();
  }, []);

  const handleCameraScan = async () => {
    // Check scan quota first
    try {
      if (!cameraPermission?.granted) {
        const permissionResult = await requestCameraPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission denied', 'Camera permission is required.');
          return;
        }
      }
      
      // Updates scan quota using global context
      await refreshScansRemaining();
      
      // After refreshing, check if user has scans
      if (scansRemaining !== null && scansRemaining <= 0) {
        Alert.alert(
          'Scan Limit Reached',
          'You have used all your available scans. Would you like to purchase more?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Subscription', 
              onPress: () => router.push('/screens/SubscriptionScreen')
            }
          ]
        );
        return;
      }
      
      // Continue with existing camera logic
      setLoading(true);
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const pickedUri = result.assets[0].uri;
          const fileName = pickedUri.split('/').pop() || `image_${Date.now()}.jpg`;
          const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '/';
          const newPath = docDir + fileName;
          await FileSystem.copyAsync({ from: pickedUri, to: newPath });
          
          // Set optimistic scan update before API call
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          try {
            // Using centralized API function with better error handling
            const apiResult = await cameraToApi(newPath);
            
            // Verify that the result is valid and complete
            // Check for required properties to make sure result is valid
            if (!apiResult || typeof apiResult !== 'object') {
              throw new Error('Server returned an invalid response format');
            }
            
            // Create a safe serialized version of the result
            let serializedResult;
            try {
              serializedResult = JSON.stringify(apiResult);
              // Validate the serialized result can be parsed back
              JSON.parse(serializedResult);
            } catch (jsonError) {
              throw new Error('Failed to serialize API response');
            }
            
            router.replace({
              pathname: '/screens/ProcessingResultScreen',
              params: { 
                result: serializedResult,
                imageUri: newPath 
              }
            });
          } catch (apiError) {
            // Restore optimistic update on error
            setOptimisticScans(scansRemaining);
            
            // Use improved error handling
            showErrorAlert(apiError, {
              navigateToHome: false,
              retryAction: () => handleCameraScan(),
              onDismiss: () => {
                // Always refresh scan quota after any attempt
                refreshScansRemaining();
              }
            });
          }
        }
      } catch (err) {
        // Use improved error handling for camera errors
        showErrorAlert(err, {
          title: 'Camera Error',
          onDismiss: () => {
            // Always refresh scan quota after any attempt
            refreshScansRemaining();
          }
        });
      }
      setLoading(false);
    } catch (err) {
      // General error handling
      showErrorAlert(err, {
        title: 'Unexpected Error',
      });
    }
  };

  const handleImageUpload = async () => {
    // Check scan quota first
    try {
      // Updates scan quota using global context
      await refreshScansRemaining();
      
      // After refreshing, check if user has scans
      if (scansRemaining !== null && scansRemaining <= 0) {
        Alert.alert(
          'Scan Limit Reached',
          'You have used all your available scans. Would you like to purchase more?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Subscription', 
              onPress: () => router.push('/screens/SubscriptionScreen')
            }
          ]
        );
        return;
      }
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        try {
          const pickedUri = result.assets[0].uri;
          const fileName = pickedUri.split('/').pop() || `image_${Date.now()}.jpg`;
          const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '/';
          const newPath = docDir + fileName;
          await FileSystem.copyAsync({ from: pickedUri, to: newPath });
          
          // Set optimistic scan update before API call
          setOptimisticScans(scansRemaining !== null ? Math.max(scansRemaining - 1, 0) : null);
          
          try {
            // Using centralized API function with better error handling
            const apiResult = await cameraToApi(newPath);
            
            // Verify that the result is valid and complete
            // Check for required properties to make sure result is valid
            if (!apiResult || typeof apiResult !== 'object') {
              throw new Error('Server returned an invalid response format');
            }
            
            // Create a safe serialized version of the result
            let serializedResult;
            try {
              serializedResult = JSON.stringify(apiResult);
              // Validate the serialized result can be parsed back
              JSON.parse(serializedResult);
            } catch (jsonError) {
              throw new Error('Failed to serialize API response');
            }
            
            router.replace({
              pathname: '/screens/ProcessingResultScreen',
              params: { 
                result: serializedResult,
                imageUri: newPath 
              }
            });
          } catch (apiError) {
            // Restore optimistic update on error
            setOptimisticScans(scansRemaining);
            
            // Use improved error handling
            showErrorAlert(apiError, {
              navigateToHome: false,
              retryAction: () => handleImageUpload(),
              onDismiss: () => {
                // Always refresh scan quota after any attempt
                refreshScansRemaining();
              }
            });
          }
        } catch (err) {
          // Use improved error handling for image picker errors
          showErrorAlert(err, {
            title: 'Image Selection Error',
            onDismiss: () => {
              // Always refresh scan quota after any attempt
              refreshScansRemaining();
            }
          });
        }
        setLoading(false);
      }
    } catch (err) {
      // General error handling
      showErrorAlert(err, {
        title: 'Unexpected Error',
      });
    }
  };

  const handleRefreshQuota = async () => {
    try {
      setRefreshingQuota(true);
      await refreshScansRemaining();
    } catch (error) {
      console.error('Error refreshing scan quota:', error);
      Alert.alert('Error', 'Failed to refresh scan quota. Please try again.');
    } finally {
      setRefreshingQuota(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prevSelectedIds => {
      if (prevSelectedIds.includes(id)) {
        // Remove the ID if already selected
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        // Add the ID if not already selected
        return [...prevSelectedIds, id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    
    // Confirm deletion
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedIds.length} prescription${selectedIds.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all selected prescriptions
              let successCount = 0;
              let failureCount = 0;
              
              for (const id of selectedIds) {
                try {
                  // Delete all images from storage first
                  const imageUrls = await getPrescriptionImages(id);
                  for (const url of imageUrls) {
                    await deletePrescriptionImage(url);
                  }
                  
                  // Now delete the prescription from the database
                  const result = await deletePrescription(id);
                  if (result.success) {
                    successCount++;
                  } else {
                    failureCount++;
                  }
                } catch (err) {
                  failureCount++;
                  console.error(`Error deleting prescription ${id}:`, err);
                }
              }
              
              // Update the prescription list
              if (successCount > 0) {
                setPrescriptions((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
              }
              
              // Clear selection
              clearSelection();
              
              // Show results
              if (failureCount === 0) {
                Alert.alert('Deleted', `${successCount} prescription${successCount > 1 ? 's' : ''} deleted successfully.`);
              } else if (successCount === 0) {
                Alert.alert('Error', 'Failed to delete prescriptions.');
              } else {
                Alert.alert('Partial Success', `${successCount} deleted successfully, ${failureCount} failed.`);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete prescriptions.');
              console.error('Bulk deletion error:', err);
            }
          }
        }
      ]
    );
  };

  // Add a function to toggle the notification popup
  const toggleNotificationPopup = () => {
    setNotificationPopupVisible(!notificationPopupVisible);
  };

  // Add function to toggle help modal
  const toggleHelpModal = () => {
    setHelpModalVisible(!helpModalVisible);
  };

  if (user === undefined) {
    return null;
  }

  return (
    <LinearGradient
      colors={dark ? ["#121212", "#121212", "#121212"] as const : ["#4c669f", "#3b5998", "#192f6a"] as const}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <StatusBar backgroundColor={dark ? "#121212" : "#4c669f"} barStyle="light-content" translucent={false} />
        <LinearGradient 
          colors={headerGradientColors} 
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Prescriptions</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push('/screens/SubscriptionScreen')}
              >
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionBadgeText}>{optimisticScans !== null ? optimisticScans : (scansRemaining || '?')}</Text>
                </View>
                <Feather name="file-text" size={22} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={handleRefreshQuota}
                disabled={refreshingQuota}
              >
                {refreshingQuota ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="refresh-cw" size={22} color="#fff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={toggleHelpModal}
              >
                <Feather name="help-circle" size={22} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={toggleNotificationPopup}
              >
                <Feather name="bell" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Searchbar
            placeholder="Search prescriptions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={colors.primary}
            inputStyle={[styles.searchInput, { color: dark ? colors.text : '#333' }]}
            placeholderTextColor={dark ? '#aaa' : '#777'}
            theme={{
              colors: { 
                primary: colors.primary,
                placeholder: dark ? '#aaa' : '#777'
              }
            }}
          />
        </LinearGradient>

        <LinearGradient
          colors={contentGradientColors}
          style={styles.content}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Documents</Text>
            {selectedIds.length > 0 && (
              <View style={styles.selectionInfo}>
                <Text style={[styles.selectionCount, { color: colors.primary }]}>{selectedIds.length} selected</Text>
                <TouchableOpacity onPress={clearSelection} style={styles.clearSelectionButton}>
                  <Text style={styles.clearSelectionText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={filteredPrescriptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={dark 
                    ? ["#1E1E1E", "#252525", "#2A2A2A"] as const
                    : ["#ffffff", "#f8f9fa", "#f0f4f8"] as const
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.prescriptionCard, 
                    selectedIds.includes(item.id) && [
                      styles.selectedCard,
                      { borderColor: colors.primary }
                    ]
                  ]}
                >
                  <View style={styles.cardContent}>
                    <TouchableOpacity
                      onPress={() => {
                        if (thumbnails[item.id]) {
                          setSelectedImageUrl(thumbnails[item.id]!);
                          setImageViewerVisible(true);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.docIcon}>
                        {/* Thumbnail image if available */}
                        {thumbnailsLoading ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : thumbnails[item.id] ? (
                          <LinearGradient
                            colors={["#43ea2e", "#ffe600"] as const}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={{
                              borderRadius: 8,
                              padding: 2,
                              alignItems: 'center',
                              justifyContent: 'center',
                              elevation: 2,
                            }}
                          >
                            <View style={{
                              backgroundColor: colors.background,
                              borderRadius: 6,
                              width: 60,
                              height: 60,
                              overflow: 'hidden',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Image
                                source={{ uri: thumbnails[item.id] }}
                                style={{ width: '100%', height: '100%', borderRadius: 6 }}
                                resizeMode="cover"
                              />
                            </View>
                          </LinearGradient>
                        ) : (
                          <LinearGradient
                            colors={dark 
                              ? ["#2A2A2A", "#333333"] as const
                              : ["#e1f5fe", "#b3e5fc"] as const
                            }
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Feather name="file-text" size={24} color={colors.primary} />
                          </LinearGradient>
                        )}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.docInfo}
                      onPress={() => {
                        clearSelection();
                        router.push({
                          pathname: '/screens/ProcessingResultScreen',
                          params: { result: JSON.stringify(item) }
                        });
                      }}
                    >
                      <Text style={[styles.docTitle, { color: colors.text }]}>{item.patient_name}</Text>
                      <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>Doctor: {item.doctor_name}</Text>
                      <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>Date: {formatDate(item.created_at)}</Text>
                      <Text style={[styles.docDetails, { color: dark ? '#aaa' : '#666' }]}>
                        Medications: {item.medications.length}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleSelection(item.id)}
                    >
                      <MaterialIcons
                        name={selectedIds.includes(item.id) ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={selectedIds.includes(item.id) ? colors.primary : dark ? '#666' : '#bdbdbd'}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              )}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary, colors.primary, dark ? "#333" : "#192f6a"]}
                  tintColor={colors.primary}
                />
              }
            />
          )}
          {selectedIds.length > 0 && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 100,
                right: 24,
                backgroundColor: dark ? '#d32f2f' : '#ff4444',
                borderRadius: 28,
                padding: 16,
                elevation: 4,
                zIndex: 10,
              }}
              onPress={handleDelete}
            >
              <View style={styles.deleteButtonContent}>
                <MaterialIcons name="delete" size={28} color="#fff" />
                {selectedIds.length > 1 && (
                  <View style={[styles.deleteCountBadge, {
                    backgroundColor: dark ? '#333' : 'white',
                    borderColor: dark ? '#d32f2f' : '#ff4444',
                  }]}>
                    <Text style={[styles.deleteCountText, {
                      color: dark ? '#ff6666' : '#ff4444',
                    }]}>{selectedIds.length}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImageUpload}
            disabled={loading}
          >
            <LinearGradient
              colors={actionGradientColors}
              style={styles.actionButtonGradient}
            >
              <Feather name="upload" size={22} color="#fff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Upload</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCameraScan}
            disabled={loading}
          >
            <LinearGradient
              colors={actionGradientColors}
              style={styles.actionButtonGradient}
            >
              <Feather name="camera" size={22} color="#fff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Scan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Full-screen image viewer */}
        <ImageViewing
          images={selectedImageUrl ? [{ uri: selectedImageUrl }] : []}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen"
        />

        {/* Add notification popup */}
        <NotificationPopup 
          visible={notificationPopupVisible} 
          onClose={() => setNotificationPopupVisible(false)} 
        />

        {/* Help Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={helpModalVisible}
          onRequestClose={toggleHelpModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer, 
              { backgroundColor: colors.card }
            ]}>
              <View style={[
                styles.modalHeader,
                { borderBottomColor: colors.border }
              ]}>
                <Text style={[
                  styles.modalTitle, 
                  { color: colors.primary }
                ]}>Scan Instructions</Text>
                <TouchableOpacity onPress={toggleHelpModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <ScanInstructions />
              </View>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  { backgroundColor: colors.primary }
                ]} 
                onPress={toggleHelpModal}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 12 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  subscriptionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#43ea2e',
    borderRadius: 10,
    height: 18,
    minWidth: 18,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  subscriptionBadgeText: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchbar: {
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
    height: 40,
    padding: 0,
    alignItems: 'center',
  },
  searchInput: {
    color: '#333',
    fontSize: 14,
    height: 40,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
    alignSelf: 'center',
    top: Platform.OS === 'android' ? -2 : 0,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: 14,
    color: '#4c669f',
    fontWeight: 'bold',
    marginRight: 8,
  },
  clearSelectionButton: {
    padding: 4,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  prescriptionCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  docIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  docDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
    lineHeight: 16,
  },
  checkbox: {
    padding: 4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 110,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
  },
  actionButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4c669f',
  },
  deleteButtonContent: {
    position: 'relative',
  },
  deleteCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteCountText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradientContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 80, // Add padding at bottom to avoid FAB overlap
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 16,
    width: '85%',
    maxWidth: 360,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingBottom: 5,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
</file>
<file path="app/(tabs)/ProfileScreen.tsx">
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Modal, Animated, Platform, StatusBar, Alert, RefreshControl, Linking } from 'react-native';
import { Text, Avatar, Button, Card, List, TextInput, ActivityIndicator, Surface, IconButton, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../components/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../components/supabaseClient';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@react-navigation/native';
import { gradientColors } from '@/constants/ThemeConfig';

// In-memory fallback for when SecureStore is not available
const memoryStore: Record<string, string> = {};

// Helper for SecureStore with fallback to memory
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      return memoryStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      memoryStore[key] = value;
    }
  },
  deleteItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore unavailable, using memory fallback:', e);
      delete memoryStore[key];
    }
  }
};

export default function ProfileScreen() {
  const { user, isEmailVerified, resendVerificationEmail, logout, scansRemaining, refreshScansRemaining, refreshSession, resetNavigationState } = useAuth();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || user?.email || '');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');
  const [refreshing, setRefreshing] = useState(false);

  // Define theme-based gradient colors
  const headerGradientColors = dark 
    ? gradientColors.dark.header
    : gradientColors.light.header;

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.name || user.email || '');
      setDisplayEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update the user profile in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        data: { name },
      });
      
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      
      // Set temporary success message
      setSuccess('Profile updated!');
      
      // Flag that we're updating the profile - used to fix navigation state issues
      await safeStorage.setItem('profile_updated', 'true');
      
      // Refresh the session to get updated user data
      await refreshSession();
      
      // Update local display values
      setDisplayName(name || email);
      setDisplayEmail(email);
      
      // Clear navigation state to prevent ScreenStackFragment errors on restart
      await safeStorage.deleteItem('navigation-state');
      
      // Close the modal after a short delay
      setTimeout(() => {
        setEditModal(false);
        setSuccess('');
        // Remove flag after profile update is complete
        safeStorage.deleteItem('profile_updated');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
      // Cleanup on error
      safeStorage.deleteItem('profile_updated');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshScansRemaining();
    refreshSession().then(() => {
      setRefreshing(false);
    }).catch(() => {
      setRefreshing(false);
    });
  }, []);

  // Check if there was an interrupted profile update on component mount
  useEffect(() => {
    const checkProfileUpdateState = async () => {
      try {
        const profileUpdated = await safeStorage.getItem('profile_updated');
        if (profileUpdated === 'true') {
          // Clear navigation state and the flag
          await safeStorage.deleteItem('navigation-state');
          await safeStorage.deleteItem('profile_updated');
          // Refresh the session
          await refreshSession();
        }
      } catch (error) {
        console.error('Error checking profile update state:', error);
      }
    };
    
    checkProfileUpdateState();
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Gradient Header with Avatar */}
      <LinearGradient 
        colors={headerGradientColors as any} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {user?.user_metadata?.picture ? (
            <Avatar.Image 
              size={80} 
              source={{ uri: user.user_metadata.picture }} 
              style={styles.avatar} 
            />
          ) : (
            <Avatar.Icon size={80} icon="account" style={styles.avatar} color={colors.background} />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.headerName}>{displayName}</Text>
            <Text style={styles.headerEmail}>{displayEmail}</Text>
            {!isEmailVerified && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationText}>Email not verified</Text>
                <Button 
                  mode="outlined" 
                  onPress={resendVerificationEmail} 
                  style={styles.verificationButton}
                  labelStyle={[styles.verificationButtonLabel, { color: '#fff' }]}
                  icon="email-alert"
                >
                  Resend Verification
                </Button>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Premium Card */}
      <Surface style={[styles.premiumCard, { backgroundColor: colors.card }]} elevation={2}>
        <View style={styles.premiumContent}>
          <MaterialIcons name="workspace-premium" size={32} color={colors.primary} />
          <View style={styles.premiumInfo}>
            <Text variant="titleMedium" style={[styles.premiumTitle, { color: colors.text }]}>Go to Premium</Text>
            <Text variant="bodySmall" style={[styles.premiumSubtitle, { color: dark ? '#aaa' : '#666' }]}>Get unlimited all access</Text>
          </View>
          <Button 
            mode="contained" 
            style={styles.upgradeButton}
            labelStyle={styles.upgradeButtonLabel}
            icon="arrow-right"
            onPress={() => router.push('/screens/SubscriptionScreen')}
          >
            Upgrade
          </Button>
        </View>
      </Surface>

      {/* Account Section */}
      <Surface style={[styles.sectionCard, { backgroundColor: colors.card }]} elevation={2}>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" color={colors.primary} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setEditModal(true)}
          style={styles.listItem}
        />
        <List.Item
          title="Document Remaining"
          description="Your remaining document quota"
          left={props => <List.Icon {...props} icon="file-document" color={colors.primary} />}
          right={props => <Text style={[styles.remainingCount, { color: colors.text }]}>{scansRemaining !== null ? scansRemaining : '-'}</Text>}
          style={styles.listItem}
        />
      </Surface>

      {/* Logout Button */}
      <Button 
        mode="contained" 
        style={styles.logoutButton} 
        onPress={() => { logout(); router.replace('/LoginScreen'); }}
        icon="logout"
        contentStyle={styles.logoutButtonContent}
      >
        Logout
      </Button>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContent, { backgroundColor: colors.card }]} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <IconButton
                icon={props => <Feather name="x" size={24} color={colors.text} />}
                onPress={() => setEditModal(false)}
              />
            </View>
            <View style={styles.profilePhotoContainer}>
              {user?.user_metadata?.picture ? (
                <>
                  <Avatar.Image 
                    size={80} 
                    source={{ uri: user.user_metadata.picture }} 
                    style={styles.modalAvatar} 
                  />
                  <Text style={[styles.profilePhotoHint, { color: colors.text }]}>
                    Your profile photo is inherited from Google Sign-in
                  </Text>
                </>
              ) : (
                <Avatar.Icon size={80} icon="account" style={styles.modalAvatar} color={colors.text} />
              )}
            </View>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              mode="outlined"
              left={<TextInput.Icon icon="account" color={colors.text} />}
              theme={{ colors: { text: colors.text, primary: colors.primary, placeholder: colors.text } }}
              placeholderTextColor={colors.text}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              left={<TextInput.Icon icon="email" color={colors.text} />}
              theme={{ colors: { text: colors.text, primary: colors.primary, placeholder: colors.text } }}
              placeholderTextColor={colors.text}
            />
            {error ? <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text> : null}
            {success ? <Text style={[styles.successText, { color: '#4CAF50' }]}>{success}</Text> : null}
            <Button 
              mode="contained" 
              onPress={handleUpdateProfile} 
              disabled={loading} 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              contentStyle={styles.saveButtonContent}
              icon="content-save"
            >
              Save Changes
            </Button>
            {loading && <ActivityIndicator style={styles.loadingIndicator} />}
          </Surface>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  headerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  verificationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  verificationText: {
    color: '#ffd700',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  verificationButton: {
    borderColor: '#ffd700',
  },
  verificationButtonLabel: {
    color: '#ffd700',
  },
  premiumCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  premiumSubtitle: {
    color: '#666',
  },
  upgradeButton: {
    backgroundColor: '#4c669f',
    borderRadius: 12,
  },
  upgradeButtonLabel: {
    color: '#fff',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 12,
  },
  remainingCount: {
    color: '#4c669f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#4c669f',
  },
  logoutButtonContent: {
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  input: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#4c669f',
  },
  saveButtonContent: {
    height: 48,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  profilePhotoHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
}); 
</file>
<file path="app/screens/CameraScreen.tsx">
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../components/AuthContext';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';
import { cameraToApi } from '../../components/utils/scanUtils';
import { showErrorAlert } from '../../components/utils/errorHandler';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { scansRemaining, refreshScansRemaining } = useAuth();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function takePicture() {
    // Check if user has scans remaining
    if (!scansRemaining || scansRemaining <= 0) {
      Alert.alert(
        "No Scans Remaining", 
        "You've used all your available scans. Please purchase more to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Purchase", onPress: () => router.push("/screens/SubscriptionScreen") }
        ]
      );
      return;
    }
    
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const ocrResult = await cameraToApi(photo.uri);
        
        // Verify that the result is valid and complete
        // Check for required properties to make sure result is valid
        if (!ocrResult || typeof ocrResult !== 'object') {
          throw new Error('Server returned an invalid response format');
        }
        
        // Create a safe serialized version of the result
        let serializedResult;
        try {
          serializedResult = JSON.stringify(ocrResult);
          // Validate the serialized result can be parsed back
          JSON.parse(serializedResult);
        } catch (jsonError) {
          throw new Error('Failed to serialize API response');
        }
        
        // Updates scan quota using global context
        refreshScansRemaining();
        
        router.replace({
          pathname: '/screens/ProcessingResultScreen',
          params: { 
            result: serializedResult,
            imageUri: photo.uri 
          }
        });
      } catch (err) {
        // Use improved error handling
        showErrorAlert(err, {
          navigateToHome: true,
          navigateHome: () => router.replace('/(tabs)'),
          retryAction: takePicture,
          onDismiss: () => {
            // Always refresh scan quota after any attempt (success or failure)
            refreshScansRemaining();
          }
        });
        
        // Always refresh scan quota after any attempt (success or failure)
        refreshScansRemaining();
      }
      setLoading(false);
    }
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.disclaimerContainer}>
        <DisclaimerComponent type="ai" compact={true} />
      </View>
      
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.disclaimerBanner}>
            <Text style={styles.disclaimerText}>
              Not intended for medical use. For organization purposes only.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.captureButton]} 
              onPress={takePicture}
            >
              <Text style={styles.text}>Capture</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.text}>Uploading...</Text>
            </View>
          )}
        </CameraView>
      </View>
      
      <View style={styles.footerDisclaimerContainer}>
        <DisclaimerComponent type="medical" compact={true} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 8,
  },
  captureButton: {
    backgroundColor: 'rgba(255,69,58,0.7)',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  footerDisclaimerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  disclaimerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    alignItems: 'center',
  },
  disclaimerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  }
}); 
</file>
<file path="app/screens/CreateNewPasswordScreen.tsx">
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function CreateNewPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Create New Password</Text>
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        label="Confirm New Password"
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Create
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4 },
}); 
</file>
<file path="app/screens/ForgotPasswordScreen.tsx">
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Forgot Password</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Submit
      </Button>
      <Button mode="text" style={styles.button} onPress={() => {}}>
        Back to Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4 },
}); 
</file>
<file path="app/screens/PriceChartScreen.tsx">
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function PriceChartScreen() {
  // Placeholder for chart and medication details
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Price Comparison Chart</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Chart will be displayed here.</Text>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Medication details will be displayed here.</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  card: { marginBottom: 16 },
}); 
</file>
<file path="app/screens/PrivacyPolicyScreen.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';

/**
 * Privacy Policy Screen
 * Displays the app's privacy policy with compliance information for Google Play
 */
const PrivacyPolicyScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: 'Privacy Policy',
        headerTitleAlign: 'center',
      }} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
        
        <DisclaimerComponent type="medical" />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This Privacy Policy describes how we collect, use, process, and disclose your information, 
            including personal information, in conjunction with your access to and use of the AI Prescription Saathi app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.1 Prescription Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Prescription Images: When you scan a prescription, we collect the image you capture.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Extracted Text Data: Our AI technology extracts text information from your prescriptions 
            including medication names, dosages, frequencies, doctor information, and dates.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Metadata: We collect metadata about your prescriptions such as when they were scanned 
            and any tags or notes you add.
          </Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>1.2 Account Information</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Email address
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Authentication information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Profile information you choose to provide
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Process and Store Your Data</Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.1 Data Processing</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • OCR Processing: Prescription images are processed using optical character recognition 
            (OCR) technology to extract text.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • AI Analysis: Our AI technology attempts to identify and categorize prescription 
            elements (medications, dosages, etc.).
          </Text>
          
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>2.2 Data Storage</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Encryption: All prescription data is encrypted both in transit and at rest 
            using industry-standard encryption protocols.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Storage Location: Data is stored on secure servers hosted by our cloud service provider.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Who Can Access Your Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • User Access: Your prescription data is only accessible to you through your authenticated account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Staff Access: Our staff does not have routine access to your personal prescription details.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Third Parties: We do not sell or share your prescription data with third parties for marketing purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Security Measures</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We implement comprehensive security measures to protect your personal information:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Industry-Standard Encryption: All data is encrypted in transit and at rest.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Secure Authentication: We use secure authentication mechanisms to protect your account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Regular Security Audits: We conduct regular security assessments of our systems.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. AI Processing Limitations</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Our AI-powered scanning technology has limitations and may not be 100% accurate in all cases. 
            Users should always verify all extracted information for accuracy. We do not guarantee the 
            accuracy of information extracted from prescriptions and this app should not be used as a 
            substitute for professional medical advice.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using AI Prescription Saathi, you acknowledge that the app is for personal organizational purposes only, 
          and not for medical diagnosis, treatment decisions, or as a substitute for professional medical advice.
        </Text>
        
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          If you have questions about this Privacy Policy or our data practices, please contact us at:
          contact@autoomstudio.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contactInfo: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  }
});

export default PrivacyPolicyScreen; 
</file>
<file path="app/screens/ProcessingResultScreen.tsx">
import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Alert, ActivityIndicator, TouchableOpacity, BackHandler, StatusBar, Platform, RefreshControl } from 'react-native';
import { Text, Card, Surface, Divider, useTheme, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, router as globalRouter, useFocusEffect } from 'expo-router';
import { savePrescription, checkPrescriptionExists } from '@/components/prescriptionService';
import { useAuth } from '@/components/AuthContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { getSignedPrescriptionImageUrl } from '@/components/storageService';
import { supabase } from '@/components/supabaseClient';
import DisclaimerComponent from '@/components/ui/DisclaimerComponent';
import { AppStatusBar, getStatusBarHeight } from '@/components/ui/AppStatusBar';
import { showErrorAlert } from '@/components/utils/errorHandler';
import { useTheme as useReactNavigationTheme } from '@react-navigation/native';
import { useTheme as usePaperTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');

// TypeScript interfaces for prescription data
interface Medication {
  brand_name?: string;
  medicineName?: string;
  generic_name?: string;
  genericName?: string;
  dosage?: string;
  strength?: string;
  frequency?: string;
  duration?: string;
  purpose?: string;
  instructions?: string;
  side_effects?: string;
  precautions?: string;
}

interface PatientDetails {
  name?: string;
  age?: string | number;
  patient_id?: string;
  contact?: string;
  address?: string;
}

interface DoctorDetails {
  name?: string;
  specialization?: string;
  license_number?: string;
  contact?: string;
  chambers?: string;
  visiting_hours?: string;
}

interface Prescription {
  patient_details?: PatientDetails;
  doctor_details?: DoctorDetails;
  medications?: Medication[];
  general_instructions?: string;
  additional_info?: string;
  alternate_medicine?: string;
  home_remedies?: string;
  image_uri?: string; // Add image URI from camera/gallery
}

export default function ProcessingResultScreen() {
  const theme = usePaperTheme();
  const { colors: navigationColors, dark } = useReactNavigationTheme();
  const router = useRouter();
  const { user, refreshScansRemaining, scansRemaining } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const params = useLocalSearchParams();
  const [optimisticScans, setOptimisticScans] = useState<number | null>(null);
  const [processingError, setProcessingError] = useState<Error | null>(null);
  const [isErrorHandled, setIsErrorHandled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Determine mode: 'view' (from history/db) or 'save' (after OCR)
  const mode = params.mode === 'view' || (typeof params.result === 'string' && (() => {
    try {
      return JSON.parse(params.result as string)?.id;
    } catch (e) {
      return false;
    }
  })()) ? 'view' : 'save';
  
  // Handle both string and object params
  const prescriptionData = useMemo(() => {
    try {
      // Try to parse the result as JSON if it's a string
      if (typeof params.result === 'string') {
        return JSON.parse(params.result as string);
      } else {
        // Already an object
        return params.result as any;
      }
    } catch (parseError) {
      // Handle JSON parse errors
      console.error('Error parsing prescription data:', parseError);
      setProcessingError(parseError as Error);
      
      // Return a minimal valid object to prevent rendering errors
      return { 
        error: true, 
        patient_details: { name: '' },
        doctor_details: { name: '' },
        medications: [],
        general_instructions: 'Error processing prescription',
        additional_info: ''
      };
    }
  }, [params.result]);
  
  // Handle processing errors immediately when detected
  useEffect(() => {
    if (processingError && !isErrorHandled) {
      showErrorAlert(processingError, {
        title: 'Processing Error',
        navigateToHome: true,
        navigateHome: () => {
          try {
            globalRouter.replace('/(tabs)');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
      });
      setIsErrorHandled(true);
    }
  }, [processingError, isErrorHandled]);
  
  // Get image URI if it exists
  const imageUri = params.imageUri as string | undefined;
  
  const prescription: Prescription = {
    ...prescriptionData,
    image_uri: imageUri
  };

  // Map flat DB fields to nested structure if needed
  let normalizedPrescription = { ...prescription };
  if (!prescription.patient_details && (prescription as any).patient_name) {
    normalizedPrescription.patient_details = {
      name: (prescription as any).patient_name,
      age: (prescription as any).patient_age,
      patient_id: (prescription as any).patient_id,
      contact: (prescription as any).patient_contact,
      address: (prescription as any).patient_address,
    };
  }
  if (!prescription.doctor_details && (prescription as any).doctor_name) {
    normalizedPrescription.doctor_details = {
      name: (prescription as any).doctor_name,
      specialization: (prescription as any).doctor_specialization,
      license_number: (prescription as any).doctor_license,
      contact: (prescription as any).doctor_contact,
      chambers: (prescription as any).doctor_chambers,
      visiting_hours: (prescription as any).doctor_visiting_hours,
    };
  }
  // Use normalizedPrescription for all further logic
  // if (__DEV__) console.log('Prescription Details Debug:', normalizedPrescription);
  const patient = normalizedPrescription.patient_details || {};
  const doctor = normalizedPrescription.doctor_details || {};
  const medications = normalizedPrescription.medications || [];
  const generalInstructions = normalizedPrescription.general_instructions || (normalizedPrescription as any)?.diagnosis || '';
  const additionalInfo = normalizedPrescription.additional_info || (normalizedPrescription as any)?.notes || '';
  const alternateMedicine = normalizedPrescription.alternate_medicine || (normalizedPrescription as any)?.alternate_medicine || '';
  const homeRemedies = normalizedPrescription.home_remedies || (normalizedPrescription as any)?.home_remedies || '';

  // Helper to show 'Not available' for empty fields
  const showValue = (val: any, fieldType?: string) => {
    if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim().length < 2)) {
      // Use "Not readable" specifically for patient name
      if (fieldType === 'patient_name') {
        return 'Not readable';
      }
      return 'Not available';
    }
    return val;
  };

  // Find prescription image from DB if available
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(undefined);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSignedUrl = async () => {
      setImageLoading(true);
      let filePath: string | undefined = undefined;
      
      // Use only necessary debug logs
      // if (__DEV__) {
      //   console.log('Image Data Check:', {
      //     imageUri: normalizedPrescription.image_uri,
      //     prescriptionImages: (normalizedPrescription as any).prescription_images,
      //     imageUrl: (normalizedPrescription as any).image_url
      //   });
      // }
      
      // Check all possible locations for the image
      if (Array.isArray((normalizedPrescription as any).prescription_images) && 
          (normalizedPrescription as any).prescription_images.length > 0) {
        filePath = (normalizedPrescription as any).prescription_images[0].image_url;
      } else if ((normalizedPrescription as any).image_url) {
        filePath = (normalizedPrescription as any).image_url;
      }
      
      if (filePath) {
        try {
          // Get a longer-lived signed URL (3 hours instead of default 1 hour)
          const signedUrl = await getSignedPrescriptionImageUrl(filePath, 10800);
          
          if (isMounted) {
            // Add cache-busting query param if URL exists
            if (signedUrl) {
              const urlWithCacheBuster = `${signedUrl}${signedUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
              setDisplayImageUrl(urlWithCacheBuster);
            } else {
              setDisplayImageUrl(undefined);
              // console.error('Failed to get signed URL for path:', filePath);
            }
          }
          // if (__DEV__) console.log('Signed URL:', signedUrl);
        } catch (error) {
          // console.error('Error getting signed URL:', error);
          // Try direct path as fallback
          if (isMounted) {
            const publicUrl = supabase.storage.from('prescription-images').getPublicUrl(filePath).data.publicUrl;
            if (publicUrl) {
              const urlWithCacheBuster = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
              setDisplayImageUrl(urlWithCacheBuster);
              // console.log('Using public URL as fallback');
            } else {
              setDisplayImageUrl(undefined);
            }
          }
        }
      } else if (normalizedPrescription.image_uri) {
        setDisplayImageUrl(normalizedPrescription.image_uri);
        // if (__DEV__) console.log('Using direct image URI:', normalizedPrescription.image_uri);
      } else {
        setDisplayImageUrl(undefined);
        // if (__DEV__) console.log('No image URL available');
      }
      setImageLoading(false);
    };
    fetchSignedUrl();
    return () => { isMounted = false; };
  }, [normalizedPrescription.image_uri, 
      // Use stable reference checks for arrays and objects
      JSON.stringify((normalizedPrescription as any).prescription_images),
      (normalizedPrescription as any).image_url]);

  useEffect(() => {
    // When scansRemaining changes, update optimisticScans
    setOptimisticScans(scansRemaining);
  }, [scansRemaining]);

  // Process prescription when component mounts in 'save' mode
  useEffect(() => {
    if (mode === 'save' && !saveAttempted) {
      // Auto-save prescription and deduct quota immediately
      const autoSavePrescription = async () => {
        if (!user) {
          Alert.alert('Error', 'No user logged in. Please log in and try again.', [
            { text: 'OK', onPress: () => navigateToHome() }
          ]);
          return;
        }

        try {
          setSaving(true);
          
          // First call the process_prescription RPC to ensure quota is used
          const { data: scanProcessed, error: scanError } = await supabase.rpc('process_prescription', { 
            user_id: user.id 
          });
          
          if (scanError) {
            console.error('Scan processing error:', scanError);
            showErrorAlert(scanError, {
              title: 'Processing Error',
              onDismiss: () => {
                setSaving(false);
                setSaveAttempted(true);
              }
            });
            return;
          }
          
          // Optimistically decrement quota
          setOptimisticScans((prev) => (prev !== null ? Math.max(prev - 1, 0) : null));
          
          // Set default patient name if missing or too short
          const patientName = (!patient.name || patient.name.trim().length < 2) 
            ? 'Not readable' 
            : patient.name;
          
          const prescriptionToSave = {
            user_id: user.id,
            doctor_name: doctor.name || '',
            patient_name: patientName, // Use defaulted patient name
            date: new Date().toISOString().split('T')[0],
            diagnosis: generalInstructions,
            notes: additionalInfo,
            alternate_medicine: alternateMedicine,
            home_remedies: homeRemedies,
            image_uri: normalizedPrescription.image_uri, // Pass the image URI for upload
            medications: Array.isArray(medications) ? medications.map(med => ({
              name: med.brand_name || med.medicineName || '',
              dosage: med.dosage || med.strength || '',
              frequency: med.frequency || '',
              duration: med.duration || '',
              instructions: med.instructions || ''
            })) : [] // Ensure we have a valid array even if no medications
          };
          
          const result = await savePrescription(prescriptionToSave);
          setSaving(false);
          setSaveAttempted(true);
          
          if (!result.success) {
            if (result.isDuplicate) {
              Alert.alert('Already Exists', 'This prescription has already been saved to your history.');
            } else {
              showErrorAlert(result.error || new Error('Failed to save prescription'), {
                title: 'Save Error'
              });
            }
          } else {
            Alert.alert('Success', 'Prescription saved successfully!');
          }
          
          // Refresh global scan quota after save (success or failure)
          await refreshScansRemaining();
        } catch (error) {
          setSaving(false);
          setSaveAttempted(true);
          showErrorAlert(error, {
            title: 'Save Error',
            onDismiss: () => refreshScansRemaining()
          });
        }
      };
      
      autoSavePrescription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modified handleSave to not require verification
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in. Please log in and try again.', [
        { text: 'OK', onPress: () => navigateToHome() }
      ]);
      return;
    }
    
    if (saveAttempted) {
      // If already saved, check if we're trying to save again
      Alert.alert(
        'Already Saved',
        'This prescription has already been saved to your history.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    try {
      setSaving(true);
      
      // First call the process_prescription RPC to ensure quota is used
      const { data: scanProcessed, error: scanError } = await supabase.rpc('process_prescription', { 
        user_id: user.id 
      });
      
      if (scanError) {
        console.error('Scan processing error:', scanError);
        showErrorAlert(scanError, {
          title: 'Processing Error',
          onDismiss: () => {
            setSaving(false);
            setSaveAttempted(true);
          }
        });
        return;
      }
      
      // Optimistically decrement quota
      setOptimisticScans((prev) => (prev !== null ? Math.max(prev - 1, 0) : null));
      
      // Set default patient name if missing or too short
      const patientName = (!patient.name || patient.name.trim().length < 2) 
        ? 'Not readable' 
        : patient.name;
      
      const prescriptionToSave = {
        user_id: user.id,
        doctor_name: doctor.name || '',
        patient_name: patientName, // Use defaulted patient name
        date: new Date().toISOString().split('T')[0],
        diagnosis: generalInstructions,
        notes: additionalInfo,
        alternate_medicine: alternateMedicine,
        home_remedies: homeRemedies,
        image_uri: normalizedPrescription.image_uri, // Pass the image URI for upload
        medications: Array.isArray(medications) ? medications.map(med => ({
          name: med.brand_name || med.medicineName || '',
          dosage: med.dosage || med.strength || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || ''
        })) : [] // Ensure we have a valid array even if no medications
      };
      
      const result = await savePrescription(prescriptionToSave);
      setSaving(false);
      setSaveAttempted(true);
      
      if (!result.success) {
        if (result.isDuplicate) {
          Alert.alert('Already Exists', 'This prescription has already been saved to your history.');
        } else {
          showErrorAlert(result.error || new Error('Failed to save prescription'), {
            title: 'Save Error'
          });
        }
      } else {
        Alert.alert('Success', 'Prescription saved successfully!');
        // Refresh global scan quota after successful save
        await refreshScansRemaining();
      }
    } catch (error) {
      setSaving(false);
      setSaveAttempted(true);
      showErrorAlert(error, {
        title: 'Save Error',
        onDismiss: () => refreshScansRemaining()
      });
    }
  };

  // Improved navigation to home screen
  const navigateToHome = () => {
    try {
      globalRouter.replace('/(tabs)');
    } catch (error) {
      // console.error('Navigation error:', error);
    }
  };

  // Handle back button presses - prevent app from closing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show confirmation dialog if in 'save' mode
        if (mode === 'save' && !saveAttempted) {
          Alert.alert(
            'Discard Prescription?',
            'Are you sure you want to go back? Any changes will be lost.',
            [
              { text: 'Stay', style: 'cancel' },
              { 
                text: 'Discard', 
                onPress: () => navigateToHome(),
                style: 'destructive' 
              }
            ]
          );
          return true; // Prevents default behavior
        } else {
          // Simply navigate back to home if already saved or in view mode
          navigateToHome();
          return true; // Prevents default behavior
        }
      };

      // Add back button listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Clean up listener when component unmounts
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [mode, saveAttempted])
  );

  const onRefresh = React.useCallback(() => {
    if (mode === 'view') {
      setRefreshing(true);
      // Only refresh scan quota in view mode since we can't re-run OCR
      refreshScansRemaining().then(() => {
        setRefreshing(false);
      }).catch(() => {
        setRefreshing(false);
      });
    }
  }, [mode]);

  return (
    <>
      <AppStatusBar />
      <View style={[styles.container, { backgroundColor: navigationColors.background }]}>
        <ScrollView 
          style={[styles.scrollContainer, { backgroundColor: navigationColors.background }]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              enabled={mode === 'view'} // Only enable pull-to-refresh in view mode
              colors={["#4c669f", "#3b5998", "#192f6a"]}
              tintColor="#4c669f"
            />
          }
        >
          {/* Add medical disclaimer at the top */}
          {mode === 'save' && (
            <DisclaimerComponent type="medical" style={styles.disclaimer} />
          )}

          <Text style={[styles.title, { color: navigationColors.text }]}>Prescription Details</Text>

          {/* Display the prescription image if available */}
          {imageLoading ? (
            <ActivityIndicator size="large" color="#4c669f" style={{ marginVertical: 24 }} />
          ) : (
            <Card style={styles.card} elevation={4}>
              <LinearGradient colors={["#614385", "#516395"]} style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Prescription Image</Text>
              </LinearGradient>
              <Card.Content style={styles.imageContainer}>
                {displayImageUrl ? (
                  <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                    <LinearGradient
                      colors={["#43ea2e", "#ffe600"]} // top green, bottom yellow
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={{
                        borderRadius: 12,
                        padding: 3,
                        alignSelf: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 9,
                        width: 300,
                        height: 300,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Image
                          key={displayImageUrl}
                          source={{ uri: displayImageUrl }}
                          style={{ width: '100%', height: '100%', borderRadius: 9 }}
                          resizeMode="contain"
                          onError={(e) => {
                            // console.error('Image loading error:', e.nativeEvent.error);
                            // console.error('Failed image URL:', displayImageUrl);
                            // if (__DEV__) {
                            //   console.log('Failed image URL:', displayImageUrl);
                            //   Alert.alert('Image Error', `Failed to load image: ${e.nativeEvent.error}\nURL: ${displayImageUrl ? displayImageUrl.substring(0, 30) + '...' : 'undefined'}`);
                            // }
                          }}
                          onLoad={(e) => {
                            // console.log('Image loaded successfully:', displayImageUrl, e.nativeEvent.source);
                          }}
                        />
                      </View>
                    </LinearGradient>
                    <View style={{ marginTop: 5, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
                      <Text style={{ fontSize: 11, color: '#333' }}>Image URL exists - tap to view</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Feather name="image" size={50} color="#ccc" />
                    <Text style={styles.noImageText}>No image available</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Full-screen zoomable image viewer with improved error handling */}
          <ImageViewing
            images={displayImageUrl ? [{ uri: displayImageUrl }] : []}
            imageIndex={0}
            visible={imageViewerVisible}
            onRequestClose={() => setImageViewerVisible(false)}
            swipeToCloseEnabled={true}
            doubleTapToZoomEnabled={true}
            presentationStyle="overFullScreen"
          />

          {/* Process Results Header */}
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, { color: navigationColors.text }]}>Processing Results</Text>
            {mode === 'save' && (
              <Text style={[styles.subheaderText, { color: navigationColors.text }]}>
                Please verify the extracted information below before saving
              </Text>
            )}
          </View>

          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Patient Information</Text>
            </LinearGradient>
            <Card.Content style={{ backgroundColor: dark ? '#1e1e1e' : '#fff' }}>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Name:</Text> {showValue(patient.name, 'patient_name')}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Age:</Text> {showValue(patient.age)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>ID:</Text> {showValue(patient.patient_id)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Contact:</Text> {showValue(patient.contact)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Address:</Text> {showValue(patient.address)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#f7971e", "#ffd200"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Doctor Information</Text>
            </LinearGradient>
            <Card.Content style={{ backgroundColor: dark ? '#1e1e1e' : '#fff' }}>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Name:</Text> {showValue(doctor.name)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Specialization:</Text> {showValue(doctor.specialization)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>License:</Text> {showValue(doctor.license_number)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Contact:</Text> {showValue(doctor.contact)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Chambers:</Text> {showValue(doctor.chambers)}</Text>
              <Text style={[styles.infoText, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Visiting Hours:</Text> {showValue(doctor.visiting_hours)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#43cea2", "#185a9d"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Medications</Text>
            </LinearGradient>
            <Card.Content style={{ backgroundColor: dark ? '#1e1e1e' : '#fff' }}>
              {medications.length === 0 && <Text style={[styles.infoText, { color: navigationColors.text }]}>No medications found.</Text>}
              {medications.map((med: Medication, idx: number) => (
                <Surface key={idx} style={[styles.medicationSurface, { backgroundColor: dark ? '#1e1e1e' : '#f0f4fa' }]} elevation={2}>
                  <Text style={[styles.medicationName, { color: dark ? '#fff' : '#185a9d' }]}>{showValue((med as any).name || med.brand_name || med.medicineName)}</Text>
                  <Divider style={styles.divider} />
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Generic:</Text> {showValue(med.generic_name || med.genericName)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Dosage:</Text> {showValue(med.dosage || med.strength)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Frequency:</Text> {showValue(med.frequency)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Duration:</Text> {showValue(med.duration)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Purpose:</Text> {showValue(med.purpose)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Instructions:</Text> {showValue(med.instructions)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Side Effects:</Text> {showValue(med.side_effects)}</Text>
                  <Text style={[styles.medicationDetail, { color: navigationColors.text }]}><Text style={[styles.label, { color: theme.colors.primary }]}>Precautions:</Text> {showValue(med.precautions)}</Text>
                </Surface>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>General Instructions</Text>
            </LinearGradient>
            <Card.Content style={{ backgroundColor: dark ? '#1e1e1e' : '#fff' }}>
              <Text style={[styles.infoText, { color: navigationColors.text }]}>{showValue(generalInstructions)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} elevation={4}>
            <LinearGradient colors={["#c471f5", "#fa71cd"]} style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Additional Info</Text>
            </LinearGradient>
            <Card.Content style={{ backgroundColor: dark ? '#1e1e1e' : '#fff' }}>
              <Text style={[styles.infoText, { color: navigationColors.text }]}>{showValue(additionalInfo)}</Text>
            </Card.Content>
          </Card>

          {/* Add AI accuracy disclaimer before buttons */}
          {mode === 'save' && (
            <DisclaimerComponent type="ai" style={styles.disclaimer} />
          )}

          {/* Final disclaimer notice */}
          <Text style={[styles.legalNotice, { color: navigationColors.text }]}>
            This app is not intended for medical use and not a medical device. 
            Always consult healthcare professionals for medical advice.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  card: {
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cardHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    textShadowColor: '#0004',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#4c669f',
  },
  medicationSurface: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#f0f4fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  medicationName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#185a9d',
  },
  medicationDetail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  divider: {
    marginVertical: 6,
    backgroundColor: '#b3c6e0',
    height: 1,
  },
  saveButton: {
    backgroundColor: '#4c669f',
    marginVertical: 16,
    borderRadius: 8,
    paddingVertical: 8,
  },
  savedButton: {
    backgroundColor: '#4CAF50', // Green color for saved state
  },
  imageContainer: {
    alignItems: 'center',
    padding: 10,
    minHeight: 200,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  disclaimer: {
    marginVertical: 12,
  },
  headerContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheaderText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonInfo: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  legalNotice: {
    marginVertical: 24,
    paddingHorizontal: 16,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 16,
  },
}); 
</file>
<file path="app/screens/ResetPasswordScreen.tsx">
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Reset Password</Text>
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        label="Confirm New Password"
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Reset
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4 },
}); 
</file>
<file path="app/screens/SubscriptionScreen.tsx">
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, StatusBar, Image, BackHandler, RefreshControl } from 'react-native';
import { supabase } from '@/components/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';
import DisclaimerComponent from '@/components/ui/DisclaimerComponent';
import { useTheme } from 'react-native-paper';

// JavaScript to inject into WebView to detect JSON responses
const INJECTED_JAVASCRIPT = `
  (function() {
    // Function to check if text is JSON and contains success indicators
    function checkForSuccessJson(text) {
      try {
        // Try to parse as JSON
        const json = JSON.parse(text);
        
        // Only detect COMPLETED transactions
        // Must have both success=true AND scan_quota fields
        const isSuccess = 
          (json.success === true && json.scan_quota !== undefined) ||
          (json.success === true && json.message && json.message === "Transaction already processed");
          
        if (isSuccess) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_success',
            data: json
          }));
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    
    // Check page content on load - with specific text filtering
    setTimeout(() => {
      const body = document.body.textContent || '';
      checkForSuccessJson(body.trim());
      
      // Much more specific text detection - must have exact phrase
      if (body.includes('Transaction already processed') && 
          body.includes('scan_quota')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'payment_success_text',
          data: 'Transaction completed'
        }));
      }
    }, 1000);
    
    // Monitor DOM changes for JSON responses
    const observer = new MutationObserver(function(mutations) {
      const body = document.body.textContent || '';
      checkForSuccessJson(body.trim());
    });
    
    observer.observe(document.body, { 
      childList: true,
      subtree: true,
      characterData: true
    });
    
    true; // Return true to avoid console errors
  })();
`;

export default function SubscriptionScreen() {
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const theme = useTheme();
  const [coupon, setCoupon] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paymentDetectedRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  // Payment URL constants
  const PAYMENT_URLS = {
    PRODUCTION: 'https://u.payu.in/FJ36kPyGLjwK', // 149 Rs for 5 scans (production)
    TEST: 'https://u.payu.in/xIvM3doxpKpS',       // Test payment link (preserved for testing)
  };

  // Handle hardware back button to force close payment screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showWebView || showSuccess) {
        handlePaymentCompletion();
        return true; // Prevents default back behavior
      }
      return false; // Let default back behavior happen
    });

    return () => backHandler.remove();
  }, [showWebView, showSuccess]);

  // Register for payment result deep link handling
  useEffect(() => {
    // This handler will be called when the app is opened via deep link
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith('prescription-ai://payment-result')) {
        const url = new URL(event.url);
        const status = url.searchParams.get('status');
        
        // Mark payment as detected to prevent duplicate handling
        paymentDetectedRef.current = true;
        
        // Always close WebView
        setShowWebView(false);
        setPaymentLoading(false);
        
        if (status === 'success') {
          // Payment was successful - refresh quota and redirect immediately
          refreshScansRemaining();
          handlePaymentCompletion(true);
        } else {
          // Payment failed or was cancelled - just redirect
          handlePaymentCompletion(false);
          if (status === 'error') {
            Alert.alert('Payment Error', 'There was an issue with the payment.');
          } else if (status === 'failed') {
            Alert.alert('Payment Failed', 'Your payment was not successful.');
          } else if (status === 'cancelled') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          }
        }
      }
    };

    // Add the event listener
    Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      // Clear any remaining timeouts when component unmounts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Handle payment completion - call this function when payment is done (success or failure)
  const handlePaymentCompletion = (isSuccess = false) => {
    // Clear any existing timeouts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    // Close any open modals
    setShowWebView(false);
    setPaymentLoading(false);
    
    // If payment was successful, refresh quota
    if (isSuccess) {
      refreshScansRemaining();
    }
    
    // Always redirect to home immediately 
    navigateToHome();
  };

  // Fetch scans when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("SUBSCRIPTION SCREEN FOCUSED");
      
      // Reset payment detection state on screen focus
      paymentDetectedRef.current = false;
      
      // Always refresh scan quota when screen is focused
      if (user) {
        refreshScansRemaining();
      }
      
      return () => {
        // Clean up resources when screen loses focus
        if (pollInterval.current) clearInterval(pollInterval.current);
        if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      };
    }, [])
  );

  const showSuccessState = () => {
    setShowSuccess(true);
    setPaymentComplete(true);
    
    // Force redirect after 2 seconds as a fallback
    redirectTimeoutRef.current = setTimeout(() => {
      if (!paymentDetectedRef.current) {
        navigateToHome();
      }
    }, 2000);
  };

  const handleApplyCoupon = async () => {
    if (!user) return;
    if (!coupon.trim()) {
      setFeedback('Please enter a coupon code.');
      setFeedbackType('error');
      return;
    }
    setLoading(true);
    setFeedback('');
    setFeedbackType('');
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', {
        user_id: user.id,
        coupon_code: coupon.trim(),
      });
      if (error) throw error;
      if (data === 'success') {
        setCoupon('');
        await refreshScansRemaining();
        setFeedback('Coupon applied! Scans added.');
        setFeedbackType('success');
        
        // Show success state briefly then redirect
        showSuccessState();
        handlePaymentCompletion(true);
      } else {
        let message = 'Invalid coupon.';
        if (data === 'expired_coupon') message = 'This coupon has expired.';
        if (data === 'max_redemptions_reached') message = 'This coupon has reached its maximum redemptions.';
        if (data === 'already_used') message = 'You have already used this coupon.';
        setFeedback(message);
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedback('Failed to redeem coupon. Please try again.');
      setFeedbackType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentPress = async () => {
    // Open the PayU payment link in WebView modal
    setPaymentUrl(PAYMENT_URLS.PRODUCTION); // Use production URL for users
    setShowWebView(true);
    setPaymentLoading(true);
    
    // Set a timeout to force close payment if it takes too long (5 minutes max)
    redirectTimeoutRef.current = setTimeout(() => {
      // Force redirect if payment takes too long
      if (showWebView) {
        setShowWebView(false);
        setPaymentLoading(false);
        Alert.alert('Payment Timeout', 'The payment process is taking too long. Please try again.');
        navigateToHome();
      }
    }, 300000); // 5 minutes timeout
  };

  // Navigate to home screen with fallback
  const navigateToHome = () => {
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/');
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const { data } = event.nativeEvent;
      console.log('WebView message received:', data);
      
      const message = JSON.parse(data);
      
      // Strict validation to prevent false positives
      if (message.type === 'payment_success') {
        // Validate that this is a real completed transaction
        const jsonData = message.data;
        if (!jsonData || (typeof jsonData !== 'object')) return;
        
        // Only accept messages with scan_quota or exact transaction processed message
        if (!(jsonData.scan_quota !== undefined || 
            (jsonData.message === "Transaction already processed" && jsonData.success === true))) {
          console.log('Ignoring non-final payment message');
          return;
        }
        
        console.log('CONFIRMED payment success detected in WebView content');
        
        // Mark as detected to prevent duplicate handling
        paymentDetectedRef.current = true;
        
        // Close WebView and handle completion
        setShowWebView(false);
        setPaymentLoading(false);
        
        // Show a success message
        Alert.alert(
          'Payment Successful', 
          'Your transaction was successfully processed.'
        );
        
        // Refresh scan quota and navigate home
        refreshScansRemaining();
        handlePaymentCompletion(true);
      } 
      else if (message.type === 'payment_success_text' && 
               message.data === 'Transaction completed') {
        // Only accept our specific success message
        console.log('CONFIRMED payment success text detected');
        
        if (!paymentDetectedRef.current) {
          paymentDetectedRef.current = true;
          
          // Close WebView and handle completion
          setShowWebView(false);
          setPaymentLoading(false);
          
          // Show a success message
          Alert.alert(
            'Payment Successful', 
            'Your transaction was successfully processed.'
          );
          
          // Refresh scan quota and navigate home
          refreshScansRemaining();
          handlePaymentCompletion(true);
        }
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshScansRemaining().then(() => {
      setRefreshing(false);
    }).catch(() => {
      setRefreshing(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4c669f" />
      
      {/* Payment success overlay */}
      {showSuccess && (
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={60} color="#43ea2e" style={styles.successIcon} />
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successSubtext}>Your scans have been added.</Text>
        </View>
      )}
      
      {/* Header */}
      <LinearGradient 
        colors={["#4c669f", "#3b5998", "#192f6a"]} 
        style={styles.header}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Buy Scan Credits</Text>
          <Text style={styles.headerSubtitle}>
            Add scan credits to your account to continue using the app
          </Text>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4c669f", "#3b5998", "#192f6a"]}
            tintColor="#4c669f"
          />
        }
      >
        {/* Add medical disclaimer */}
        <DisclaimerComponent type="medical" compact={true} style={styles.disclaimer} />

        <View style={styles.quoteContainer}>
          <Text style={styles.quotaAvailable}>
            Scans Available: {scansRemaining !== null ? scansRemaining : '...'}
          </Text>
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.planName}>5 Scan Recharge Pack</Text>
          <Text style={styles.price}>₹149</Text>
          <Text style={styles.featureTitle}>What you get:</Text>
          <View style={styles.featureRow}>
            <Feather name="check" size={18} color="#43ea2e" />
            <Text style={styles.featureText}>+5 prescription scans</Text>
          </View>
          <View style={styles.featureRow}>
            <Feather name="check" size={18} color="#43ea2e" />
            <Text style={styles.featureText}>Priority customer support</Text>
          </View>
        </View>
        
        {/* Payment Button */}
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={handlePaymentPress}
          activeOpacity={0.8}
          disabled={paymentLoading}
        >
          <LinearGradient
            colors={["#43ea2e", "#ffe600"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonBorder}
          >
            {paymentLoading ? (
              <LinearGradient
                colors={["#4c669f", "#3b5998", "#192f6a"]}
                style={styles.buttonContainer}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.payNowText, {marginLeft: 10}]}>Processing...</Text>
                </View>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={["#4c669f", "#3b5998", "#192f6a"]}
                style={styles.buttonContainer}
              >
                <Text style={styles.payNowText}>Buy Now</Text>
                <Text style={styles.poweredByText}>Powered By PayU</Text>
              </LinearGradient>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Coupon section */}
        <View style={styles.couponSection}>
          <Text style={styles.couponTitle}>Have a coupon code?</Text>
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={coupon}
              onChangeText={setCoupon}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity 
              style={styles.couponButton}
              onPress={handleApplyCoupon}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.couponButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {feedbackType !== '' && (
            <Text style={[styles.feedbackText, feedbackType === 'error' ? styles.errorText : styles.successText]}>
              {feedback}
            </Text>
          )}
        </View>

        {/* Add payment disclaimer */}
        <DisclaimerComponent type="payment" style={styles.disclaimer} />
        
        <View style={styles.complianceNotice}>
          <Text style={styles.complianceText}>
            Payments are for scan quota credits only, not for clinical services. 
            All purchases are processed in compliance with Google Play's billing policy.
          </Text>
        </View>
      </ScrollView>

      {/* WebView Modal for PayU Payment */}
      <Modal
        isVisible={showWebView && paymentUrl !== null}
        style={styles.modal}
        backdropOpacity={0.8}
        onBackdropPress={() => {
          setShowWebView(false);
          setPaymentLoading(false);
        }}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complete Payment</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowWebView(false);
                setPaymentLoading(false);
              }}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ uri: paymentUrl || '' }}
            style={styles.webView}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleWebViewMessage}
            onShouldStartLoadWithRequest={(event) => {
              // Handle UPI deeplinks
              if (event.url.startsWith('upi://')) {
                Linking.openURL(event.url).catch(() => {
                  Alert.alert('Error', 'No UPI app found to handle the payment.');
                });
                return false; // Prevent WebView from loading this URL
              }
              
              // Detect payment completion in the URL
              const paymentCompletePatterns = [
                'payment-success', 'status=success', '/success',
                'payment-failure', 'status=failed', '/failed',
                'payment-cancelled', 'status=cancelled', '/cancelled'
              ];
              
              if (paymentCompletePatterns.some(pattern => event.url.includes(pattern))) {
                // Don't block loading but schedule completion handler
                setTimeout(() => {
                  const isSuccess = event.url.includes('success');
                  handlePaymentCompletion(isSuccess);
                }, 500);
              }
              
              return true;
            }}
            onNavigationStateChange={(navState) => {
              // More comprehensive payment status detection
              const url = navState.url;
              console.log('Navigation state changed:', url);
              
              // Success detection
              if (url.includes('payment-success') || 
                  url.includes('status=success') || 
                  url.includes('/success')) {
                
                console.log('Payment success detected in URL');
                
                // If we haven't already handled this payment
                if (!paymentDetectedRef.current) {
                  paymentDetectedRef.current = true;
                  
                  // Update scan quota and redirect
                  refreshScansRemaining();
                  handlePaymentCompletion(true);
                }
              } 
              // Failure detection
              else if (url.includes('payment-failure') ||
                       url.includes('status=failed') || 
                       url.includes('/failed') ||
                       url.includes('status=failure') || 
                       url.includes('/failure')) {
                       
                console.log('Payment failure detected in URL');
                
                if (!paymentDetectedRef.current) {
                  paymentDetectedRef.current = true;
                  handlePaymentCompletion(false);
                }
              } 
              // Cancellation detection
              else if (url.includes('payment-cancelled') ||
                       url.includes('status=cancelled') || 
                       url.includes('/cancelled') ||
                       url.includes('status=cancel') || 
                       url.includes('/cancel')) {
                       
                console.log('Payment cancellation detected in URL');
                
                if (!paymentDetectedRef.current) {
                  paymentDetectedRef.current = true;
                  handlePaymentCompletion(false);
                }
              }
            }}
            // Force reload to ensure JavaScript injection works
            cacheEnabled={false}
            incognito={true}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  quotaAvailable: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4c669f',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
  },
  paymentButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonBorder: {
    borderRadius: 15,
    padding: 2,
  },
  buttonContainer: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  poweredByText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  couponSection: {
    width: '100%',
    marginTop: 10,
  },
  couponTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  couponInputContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  couponInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    color: '#333',
  },
  couponButton: {
    backgroundColor: '#4c669f',
    borderRadius: 8,
    paddingHorizontal: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#ff6b6b',
  },
  successText: {
    color: '#43ea2e',
  },
  successContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  successSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  webView: {
    flex: 1,
  },
  disclaimer: {
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  complianceNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  complianceText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
  },
});
</file>
<file path="app/screens/TermsOfServiceScreen.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';

/**
 * Terms of Service Screen
 * Displays the app's terms of service with compliance information for Google Play
 */
const TermsOfServiceScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: 'Terms of Service',
        headerTitleAlign: 'center',
      }} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
        
        <DisclaimerComponent type="medical" />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing or using the AI Prescription Saathi application ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access or use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            AI Prescription Saathi is a personal organization tool designed to help users digitize and manage their prescription information. The App uses optical character recognition (OCR) and artificial intelligence to extract information from prescription images uploaded by users.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App is designed for personal organizational purposes only and is NOT intended to provide medical advice, diagnose health conditions, or replace professional healthcare services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            To use certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information and to update your information to keep it accurate, current, and complete.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Content and Responsibility</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You retain all rights to the prescription images and information you upload to the App. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, process, and store the content solely for the purpose of providing the App's services to you.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You are solely responsible for verifying the accuracy of all information extracted by the App. We do not guarantee 100% accuracy of text extraction or interpretation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Payments and Subscriptions</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App offers purchase options for scan credits. All payments are processed securely through authorized payment processors. Payments are for scan quota credits only, not for medical services or advice.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            All purchases are processed in compliance with Google Play's billing policy. Refunds are handled according to the platform's refund policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Medical Disclaimer</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            THE APP IS NOT A MEDICAL DEVICE AND IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE OR HEALTH CONDITION.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The App should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE APP.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We specifically disclaim liability for any harm, loss, or damage resulting from:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Inaccuracies in text extraction or interpretation
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Reliance on information extracted by the App
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Unauthorized access to your account or data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Modifications to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the App and updating the "Last Updated" date.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Your continued use of the App after any changes constitutes your acceptance of the new Terms.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using AI Prescription Saathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>
        
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          If you have questions about these Terms, please contact us at:
          contact@autoomstudio.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contactInfo: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  }
});

export default TermsOfServiceScreen; 
</file>
<file path="app/screens/VerifyOTPScreen.tsx">
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../components/supabaseClient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user, refreshSession, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      // Get email from user context
      const email = user?.email;
      if (!email) {
        Alert.alert('Error', 'No user email found.');
        setLoading(false);
        return;
      }
      
      // Verify OTP with Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      if (error) {
        Alert.alert('Verification Failed', error.message);
      } else {
        // Refresh session and quota after verification
        const result = await refreshSession();
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          Alert.alert(
            'Success', 
            'Email verified successfully!',
            [{ text: 'OK', onPress: () => router.replace('/') }]
          );
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during verification.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      const result = await resendVerificationEmail();
      if (result?.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'A new verification email with OTP has been sent to your inbox.');
        setCountdown(60); // 60 second cooldown
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to resend verification email.');
      console.error('Resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
      <Text style={[styles.instructions, { color: colors.text }]}>
        Enter the 6-digit code sent to your email address.
        You can also click the verification link in the email.
      </Text>
      
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
        theme={{ colors: { primary: colors.primary } }}
      />
      
      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={handleVerify} 
        loading={loading} 
        disabled={loading}
        buttonColor={colors.primary}
      >
        Verify
      </Button>
      
      <Button 
        mode="text" 
        style={styles.button} 
        onPress={handleResendOTP}
        loading={resendLoading}
        disabled={resendLoading || countdown > 0}
        textColor={colors.primary}
      >
        {countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 16 
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7
  },
  input: { 
    marginBottom: 12,
    backgroundColor: 'transparent'
  },
  button: { 
    marginVertical: 4 
  },
}); 
</file>
<file path="app/+not-found.tsx">
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});

</file>
<file path="app/_layout.tsx">
import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { LogBox, View, Text, Modal, Alert, AppState } from 'react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { NotificationProvider } from '@/components/NotificationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { PaperLightTheme, PaperDarkTheme, CustomNavigationLightTheme, CustomNavigationDarkTheme } from '@/constants/ThemeConfig';

// Suppress the TextInput.Icon defaultProps warning
LogBox.ignoreLogs([
  'TextInput.Icon: Support for defaultProps will be removed from function components in a future major release',
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;
  const navigationTheme = colorScheme === 'dark' ? CustomNavigationDarkTheme : CustomNavigationLightTheme;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Clear navigation state on cold start to prevent ScreenStackFragment errors
  useEffect(() => {
    const clearNavigationCache = async () => {
      try {
        // Check if this is a fresh app start or resume
        const lastActiveTime = await SecureStore.getItemAsync('app_last_active');
        const currentTime = Date.now().toString();
        
        // If no last active time or it was more than 5 minutes ago, clear navigation state
        if (!lastActiveTime || (parseInt(currentTime) - parseInt(lastActiveTime) > 5 * 60 * 1000)) {
          await SecureStore.deleteItemAsync('navigation-state');
          console.log('Navigation state cleared on cold start');
        }
        
        // Update the last active time
        await SecureStore.setItemAsync('app_last_active', currentTime);
      } catch (error) {
        console.error('Failed to clear navigation cache:', error);
      }
    };
    
    clearNavigationCache();
    
    // Also track app state to detect background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        SecureStore.setItemAsync('app_last_active', Date.now().toString());
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red' }}>Font failed to load.</Text>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <RootLayoutNav />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </PaperProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading, isEmailVerified, resendVerificationEmail } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  
  React.useEffect(() => {
    if (loading) return;

    // Check if we're on a protected route
    const inProtectedGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'LoginScreen' || segments[0] === 'RegisterScreen' || segments[0] === 'ForgotPasswordScreen';
    const onVerifyScreen = segments[0] === 'screens' && segments[1] === 'VerifyOTPScreen';

    if (!user && inProtectedGroup) {
      // If user not signed in but trying to access a protected route, redirect to login
      router.replace('/LoginScreen');
    } else if (user && inAuthGroup) {
      // If user is signed in but on an auth route, redirect to main app
      router.replace('/');
    }

    // If user is logged in but email is not verified, show modal and redirect to verify page
    if (user && !isEmailVerified && !onVerifyScreen) {
      setShowVerifyModal(true);
      // Short delay to ensure modal is visible before navigation
      setTimeout(() => {
        router.replace('/screens/VerifyOTPScreen');
      }, 300);
    } else if (user && isEmailVerified && onVerifyScreen) {
      // If user is verified but still on verify screen, redirect to main app
      router.replace('/');
    } else {
      setShowVerifyModal(false);
    }
  }, [user, segments, loading, isEmailVerified, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Email verification modal
  const EmailVerificationModal = () => (
    <Modal
      visible={showVerifyModal}
      animationType="slide"
      transparent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#d9534f', textAlign: 'center' }}>Email Not Verified</Text>
          <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
            Please verify your email address to continue using the app. Check your inbox for a verification link.
          </Text>
          <Button
            mode="contained"
            icon="email-alert"
            style={{ marginBottom: 12, width: '100%' }}
            onPress={async () => {
              const result = await resendVerificationEmail();
              if (result?.error) {
                Alert.alert('Error', result.error);
              } else {
                Alert.alert('Verification Email Sent', 'A new verification email has been sent to your inbox.');
              }
            }}
          >
            Resend Verification Email
          </Button>
          <Button
            mode="outlined"
            style={{ width: '100%' }}
            onPress={() => {
              setShowVerifyModal(false);
              router.replace('/screens/VerifyOTPScreen');
            }}
          >
            Go to Verification Screen
          </Button>
        </View>
      </View>
    </Modal>
  );

  // If user is authenticated, show the main app layout
  if (user) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? CustomNavigationDarkTheme : CustomNavigationLightTheme}>
        <EmailVerificationModal />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ProcessingResultScreen" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="screens/CameraScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/SubscriptionScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/VerifyOTPScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/PrivacyPolicyScreen" options={{ headerShown: true }} />
          <Stack.Screen name="screens/TermsOfServiceScreen" options={{ headerShown: true }} />
        </Stack>
      </ThemeProvider>
    );
  }

  // Non-authenticated users see the auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="screens/SubscriptionScreen" />
      <Stack.Screen name="screens/VerifyOTPScreen" />
      <Stack.Screen name="screens/PrivacyPolicyScreen" options={{ headerShown: true }} />
      <Stack.Screen name="screens/TermsOfServiceScreen" options={{ headerShown: true }} />
      <Stack.Screen name="index" redirect={true} />
      <Stack.Screen name="(tabs)" redirect={true} />
    </Stack>
  );
}

</file>
<file path="app/ForgotPasswordScreen.tsx">
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../components/supabaseClient';
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const redirectTo = 'prescriptionai://reset-password';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Surface style={styles.surface} elevation={4}>
            <BlurView intensity={20} style={styles.blurContainer}>
              <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
              <Text variant="bodyMedium" style={styles.description}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { backgroundColor: inputBackground }]}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                placeholderTextColor={isDark ? '#bbb' : '#888'}
              />
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              {message ? (
                <Text style={styles.successText}>{message}</Text>
              ) : null}
              
              <Button 
                mode="contained" 
                style={styles.button} 
                onPress={handleReset} 
                disabled={loading}
                contentStyle={styles.buttonContent}
                icon="email-send"
              >
                Send Reset Email
              </Button>
              
              <Button 
                mode="text" 
                onPress={() => router.replace('/LoginScreen')} 
                style={styles.link}
                labelStyle={styles.linkLabel}
                icon="arrow-left"
              >
                Back to Login
              </Button>
              
              {loading && (
                <ActivityIndicator 
                  style={styles.progress} 
                  size="large" 
                  color="#3b5998"
                />
              )}
            </BlurView>
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    padding: 24,
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 16, 
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
    opacity: 0.8,
  },
  input: { 
    marginBottom: 16,
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonContent: { 
    height: 48,
  },
  link: { 
    marginTop: 16,
  },
  linkLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  progress: { 
    marginTop: 24,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 
</file>
<file path="app/index.tsx">
import { Redirect } from 'expo-router';

export default function Index() {
  // This redirects any access to the root route to the LoginScreen
  // This works with our _layout.tsx approach to prevent unauthorized access
  return <Redirect href="/LoginScreen" />;
} 
</file>
<file path="app/LoginScreen.tsx">
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../components/AuthContext';
import { BlurView } from 'expo-blur';
import { GradientText } from '../components/GradientText';
import { Image } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading, loginWithGoogle } = useAuth();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';
  const googleButtonBackground = isDark ? '#23272e' : 'white';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/(tabs)');
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated, authLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLocalLoading(true);
      setError('');
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      setError('');
      console.log('Login Screen: Initiating Google Sign-In');
      const result = await loginWithGoogle();
      
      if (result?.error) {
        console.error('Login Screen: Google Sign-In failed:', result.error);
        
        // More user-friendly error message for DEVELOPER_ERROR
        if (result.error.includes('Developer Error') || result.error.includes('SHA-1')) {
          setError('There was a configuration issue with Google Sign-In. Please try again later or contact support.');
        } else {
          setError(result.error);
        }
      }
    } catch (err: any) {
      console.error('Login Screen: Unexpected error during Google Sign-In:', err);
      setError(err.message || 'An error occurred during Google Sign-In. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (authLoading) {
    return (
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Surface style={styles.surface} elevation={4}>
            <BlurView intensity={20} style={styles.blurContainer}>
              <Text variant="headlineMedium" style={styles.title}>AI Prescription Saathi</Text>
              <Text variant="titleMedium" style={styles.subtitle}>Login to your account</Text>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { backgroundColor: inputBackground }]}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                placeholderTextColor={isDark ? '#bbb' : '#888'}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { backgroundColor: inputBackground }]}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                placeholderTextColor={isDark ? '#bbb' : '#888'}
              />
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
              
              <Button 
                mode="contained" 
                style={styles.button} 
                onPress={handleLogin} 
                disabled={localLoading} 
                contentStyle={styles.buttonContent}
                icon="login"
              >
                Login
              </Button>

              {/* Divider with "or" text */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <Divider style={styles.divider} />
              </View>
              
              {/* Google Sign-In Button */}
              <Button 
                mode="outlined" 
                style={[styles.googleButton, { backgroundColor: googleButtonBackground }]} 
                onPress={handleGoogleSignIn} 
                disabled={localLoading}
                contentStyle={[styles.buttonContent, { justifyContent: 'flex-start' }]}
                icon={undefined}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <GradientText 
                    fontSize={16} 
                    fontWeight="bold">
                    Sign in with
                  </GradientText>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>
                    <Text style={{ color: '#4285F4' }}>G</Text>
                    <Text style={{ color: '#EA4335' }}>o</Text>
                    <Text style={{ color: '#FBBC05' }}>o</Text>
                    <Text style={{ color: '#4285F4' }}>g</Text>
                    <Text style={{ color: '#34A853' }}>l</Text>
                    <Text style={{ color: '#EA4335' }}>e</Text>
                  </Text>
                </View>
              </Button>
              
              <View style={styles.linkContainer}>
                <Button 
                  mode="text" 
                  onPress={() => router.push('./ForgotPasswordScreen')} 
                  style={styles.textButton}
                  labelStyle={styles.textButtonLabel}
                >
                  Forgot Password?
                </Button>
                <Button 
                  mode="text" 
                  onPress={() => router.push('./RegisterScreen')} 
                  style={styles.textButton}
                  labelStyle={styles.textButtonLabel}
                >
                  Register
                </Button>
              </View>
              
              {/* Terms and Privacy Policy Links */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By using this app, you agree to our{' '}
                  <Text 
                    style={styles.termsLink} 
                    onPress={() => router.push('/screens/TermsOfServiceScreen')}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text 
                    style={styles.termsLink} 
                    onPress={() => router.push('/screens/PrivacyPolicyScreen')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
              
              {/* Developer Login Button - Commented out for production */}
              {/* 
              <Button 
                mode="contained" 
                style={[styles.button, styles.devButton]} 
                onPress={async () => {
                  setLocalLoading(true);
                  setError('');
                  const result = await login('bejobe9275@miracle3.com', 'bejobe9275');
                  if (result.error) setError(result.error);
                  setLocalLoading(false);
                }} 
                disabled={localLoading} 
                contentStyle={styles.buttonContent}
                icon="account"
              >
                Developer Login
              </Button>
              */}
              
              {localLoading && (
                <ActivityIndicator 
                  style={styles.progress} 
                  size="large" 
                  color="#3b5998"
                />
              )}
            </BlurView>
          </Surface>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1,
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    padding: 24,
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 8, 
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 24, 
    color: '#fff',
    opacity: 0.8,
  },
  input: { 
    marginBottom: 16,
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  /* Developer button - Commented out for production */
  /*
  devButton: {
    backgroundColor: '#666',
    marginTop: 16,
  },
  */
  buttonContent: { 
    height: 48,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  textButton: { 
    marginTop: 8,
  },
  textButtonLabel: { 
    color: '#fff', 
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  progress: { 
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  termsText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: 1,
  },
  dividerText: {
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 16,
    borderColor: '#dadce0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
}); 
</file>
<file path="app/RegisterScreen.tsx">
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Surface, Checkbox, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../components/AuthContext';
import { GradientText } from '../components/GradientText';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const paperTheme = usePaperTheme();
  const isDark = paperTheme.dark;
  const inputBackground = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.9)';
  const googleButtonBackground = isDark ? '#23272e' : 'white';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to register.');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.error) {
      setError(result.error);
    } else {
      Alert.alert(
        'Registration Successful',
        'Please check your email for the verification link and OTP code.',
        [{ text: 'OK', onPress: () => router.replace('/screens/VerifyOTPScreen') }]
      );
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Automatically accept terms when using Google Sign-In
      if (!termsAccepted) {
        setTermsAccepted(true);
      }
      
      const result = await loginWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In. Please try again.');
      console.error('Google Sign-In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTerms = () => {
    router.push('/screens/TermsOfServiceScreen');
  };

  const navigateToPrivacy = () => {
    router.push('/screens/PrivacyPolicyScreen');
  };

  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Surface style={styles.surface} elevation={4}>
              <BlurView intensity={20} style={styles.blurContainer}>
                <Text variant="headlineMedium" style={styles.title}>AI Prescription Saathi</Text>
                <Text variant="titleMedium" style={styles.subtitle}>Create a new account</Text>
                
                {/* Google Sign-In Button - At the top for visibility */}
                <Button 
                  mode="outlined" 
                  style={[styles.googleButton, { backgroundColor: googleButtonBackground }]} 
                  onPress={handleGoogleSignIn} 
                  disabled={loading}
                  contentStyle={[styles.buttonContent, { justifyContent: 'flex-start' }]}
                  icon={undefined}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <GradientText 
                      fontSize={16} 
                      fontWeight="bold">
                      Sign up with
                    </GradientText>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>
                      <Text style={{ color: '#4285F4' }}>G</Text>
                      <Text style={{ color: '#EA4335' }}>o</Text>
                      <Text style={{ color: '#FBBC05' }}>o</Text>
                      <Text style={{ color: '#4285F4' }}>g</Text>
                      <Text style={{ color: '#34A853' }}>l</Text>
                      <Text style={{ color: '#EA4335' }}>e</Text>
                    </Text>
                  </View>
                </Button>
                
                {/* Divider with "or" text */}
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <Divider style={styles.divider} />
                </View>
                
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { backgroundColor: inputBackground }]}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                  theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                  placeholderTextColor={isDark ? '#bbb' : '#888'}
                />
                
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { backgroundColor: inputBackground }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  left={<TextInput.Icon icon="email" />}
                  theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                  placeholderTextColor={isDark ? '#bbb' : '#888'}
                />
                
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { backgroundColor: inputBackground }]}
                  secureTextEntry
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                  placeholderTextColor={isDark ? '#bbb' : '#888'}
                />
                
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { backgroundColor: inputBackground }]}
                  secureTextEntry
                  mode="outlined"
                  left={<TextInput.Icon icon="lock-check" />}
                  theme={{ colors: { text: isDark ? '#fff' : '#111', primary: paperTheme.colors.primary, placeholder: isDark ? '#bbb' : '#888' } }}
                  placeholderTextColor={isDark ? '#bbb' : '#888'}
                />
                
                {/* Terms and Privacy Checkbox */}
                <View style={styles.termsContainer}>
                  <Checkbox
                    status={termsAccepted ? 'checked' : 'unchecked'}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    color="#ffffff"
                  />
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I accept the{' '}
                      <Text style={styles.termsLink} onPress={navigateToTerms}>
                        Terms of Service
                      </Text>
                      {' '}and{' '}
                      <Text style={styles.termsLink} onPress={navigateToPrivacy}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
                
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
                
                <Button 
                  mode="contained" 
                  style={styles.button} 
                  onPress={handleRegister} 
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                  icon="account-plus"
                >
                  Register
                </Button>
                
                <Button 
                  mode="text" 
                  onPress={() => router.push('./LoginScreen')} 
                  style={styles.link}
                  labelStyle={styles.linkLabel}
                  icon="arrow-left"
                >
                  Back to Login
                </Button>
                
                {loading && (
                  <ActivityIndicator 
                    style={styles.progress} 
                    size="large" 
                    color="#3b5998"
                  />
                )}
              </BlurView>
            </Surface>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  surface: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    padding: 24,
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 8, 
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 24, 
    color: '#fff',
    opacity: 0.8,
  },
  input: { 
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    color: '#fff',
    fontSize: 14,
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  button: { 
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonContent: { 
    height: 48,
  },
  link: { 
    marginTop: 16,
  },
  linkLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  progress: { 
    marginTop: 24,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    height: 1,
  },
  dividerText: {
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 8,
    borderColor: '#dadce0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
}); 
</file>
<file path="app/tos.tsx">
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import DisclaimerComponent from '../components/ui/DisclaimerComponent';

/**
 * Standalone Terms of Service Page
 */
export default function TermsOfServiceScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Terms of Service' }} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: colors.text }]}>Last updated: July 13, 2025</Text>
        
        <DisclaimerComponent type="medical" />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing or using the AI Prescription Saathi application ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access or use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            AI Prescription Saathi is a personal organization tool designed to help users digitize and manage their prescription information.
          </Text>
        </View>

        <DisclaimerComponent type="ai" />

        <Text style={[styles.footer, { color: colors.text }]}>
          By using AI Prescription Saathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  updated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
}); 
</file>
<file path="assets/fonts/SpaceMono-Regular.ttf">
