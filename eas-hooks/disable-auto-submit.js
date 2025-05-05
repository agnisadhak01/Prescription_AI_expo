// Hook to prevent auto-submission of the app to Google Play Store
module.exports = async ({ config }) => {
  console.log('Disabling auto-submission to Google Play Store');
  // This hook doesn't need to do anything specific, just exists to be a placeholder
  // The main prevention happens via the configuration in eas.json
  
  return {
    success: true,
    message: 'Auto-submission disabled'
  };
}; 