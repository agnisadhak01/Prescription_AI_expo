# UI Documentation

## Screens

### 1. Login Screen (`LoginActivity`)
- **Title**: "AI Prescription Saathi"
- **Subtitle**: "Login to your account"
- **Input Fields**:
  - Email field (`emailEditText`)
  - Password field (`passwordEditText`)
- **Buttons**:
  - Login Button (`loginButton`)
  - Test Login Button (`testLoginButton`)
  - Test Connection Button (`testConnectionButton`)
- **Links**:
  - Register Link (`registerText`)
- **Progress Indicator**:
  - Progress Bar (`progressBar`)

### 2. Registration Screen (`RegisterActivity`)
- **Title**: "AI Prescription Saathi"
- **Subtitle**: "Create a new account"
- **Input Fields**:
  - Full Name field (`nameEditText`)
  - Email field (`emailEditText`)
  - Password field (`passwordEditText`)
  - Confirm Password field (`confirmPasswordEditText`)
- **Buttons**:
  - Register Button (`registerButton`)
- **Links**:
  - Login Link (`loginText`)
- **Progress Indicator**:
  - Progress Bar (`progressBar`)

### 3. Prescriptions Screen (`PrescriptionsActivity`)
- **Action Bar**:
  - Search Button (`searchButton`)
  - Profile Button (`profileButton`)
  - App Title (`appTitle`)
- **Content**:
  - RecyclerView for prescriptions list
  - SearchView for filtering prescriptions
  - No Data TextView (`noDataTextView`)
- **Progress Indicator**:
  - Progress Bar (`progressBar`)

### 4. Profile Screen (`ProfileActivity`)
- **User Information**:
  - User Name (`userName`)
  - User Email (`userEmail`)
  - Profile Avatar (`profileAvatarText`)
- **Buttons**:
  - Logout Button

### 5. Loading Screen (`LoadingActivity`)
- **Animation**:
  - Lottie Animation View (`loadingAnimation`)
  - Animation File: "loading_animation.json"

### 6. Forgot Password Screen (`ForgotPasswordActivity`)
- **Input Fields**:
  - Email field
- **Buttons**:
  - Submit Button
  - Back to Login Button

### 7. Reset Password Screen (`ResetPasswordActivity`)
- **Input Fields**:
  - New Password field
  - Confirm New Password field
- **Buttons**:
  - Reset Button

### 8. Verify OTP Screen (`VerifyOTPActivity`)
- **Input Fields**:
  - OTP field
- **Buttons**:
  - Verify Button
  - Resend OTP Button

### 9. Create New Password Screen (`CreateNewPasswordActivity`)
- **Input Fields**:
  - New Password field
  - Confirm New Password field
- **Buttons**:
  - Create Button

### 10. Price Chart Screen (`PriceChartActivity`)
- **Content**:
  - Price comparison chart
  - Medication details

## Common UI Elements

### Text Input Layouts
- Style: `@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox`
- Password fields have toggle visibility enabled
- Email fields use `textEmailAddress` input type
- Password fields use `textPassword` input type

### Buttons
- Material Design buttons
- Text buttons for navigation
- Icon buttons for actions

### Progress Indicators
- Circular progress bars
- Used during loading states
- Visibility toggled based on operation state

### Navigation
- Activity-based navigation
- Intent flags for task management
- Back navigation support

### Error Handling
- Toast messages for errors
- Input validation with error messages
- Network error indicators

### Theme
- Material Design 3 theme
- Custom color scheme
- Responsive layout using ConstraintLayout 