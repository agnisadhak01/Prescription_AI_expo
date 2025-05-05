#!/usr/bin/env node
/**
 * Custom build script to override default EAS behaviors
 * This script is designed to be called by Expo's build system
 * It ensures that builds don't automatically try to submit to app stores
 */

const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
const platform = args.find(arg => arg === '--platform=android' || arg === '--platform=ios')?.split('=')[1] || 'android';
const profile = args.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'production';

// If the command includes auto-submit, replace it with our non-auto-submit command
if (args.includes('--auto-submit-with-profile')) {
  console.log('🛑 Detected auto-submit parameter. Removing it to prevent auto-submission to app stores.');
  
  // Run build without auto-submit
  const buildCommand = `npx eas-cli build --platform ${platform} --profile ${profile} --non-interactive`;
  
  console.log(`🚀 Running custom build command: ${buildCommand}`);
  
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    console.log('✅ Build command completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build command failed:', error);
    process.exit(1);
  }
} else {
  // If no auto-submit, just pass through to regular eas-cli
  const buildCommand = `npx eas-cli ${args.join(' ')}`;
  
  console.log(`🚀 Passing through to EAS CLI: ${buildCommand}`);
  
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    console.log('✅ Build command completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build command failed:', error);
    process.exit(1);
  }
} 