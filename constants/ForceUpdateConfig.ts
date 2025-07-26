export interface ForceUpdateConfig {
  forceUpdateDate: string; // ISO date string
  minimumVersion: string; // Minimum required version
  playStoreUrl: string;
  appStoreUrl?: string;
  message: string;
  isEnabled: boolean; // Master switch to enable/disable force updates
}

export const FORCE_UPDATE_CONFIG: ForceUpdateConfig = {
  // Master switch - set to false to disable force updates completely
  isEnabled: true,
  
  // Force update deadline - July 28th, 2025 at 23:59:59 UTC
  forceUpdateDate: '2025-07-28T23:59:59.999Z',
  
  // Minimum required app version
  minimumVersion: '1.0.6',
  
  // Store URLs
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ausomemgr.prescription',
  appStoreUrl: undefined, // Add iOS App Store URL when available
  
  // User-facing message
  message: 'A critical update is required to continue using AI Prescription Saathi. Please update to the latest version to ensure security and optimal performance.'
};

// Helper function to check if force update should be triggered
export const shouldForceUpdate = (currentVersion: string): boolean => {
  if (!FORCE_UPDATE_CONFIG.isEnabled) {
    return false;
  }

  const forceUpdateDate = new Date(FORCE_UPDATE_CONFIG.forceUpdateDate);
  const currentDate = new Date();
  
  // Check if we've passed the force update date
  const isDatePassed = currentDate >= forceUpdateDate;
  
  // Check if current version is below minimum required version
  const isVersionOutdated = compareVersions(currentVersion, FORCE_UPDATE_CONFIG.minimumVersion) < 0;
  
  return isDatePassed || isVersionOutdated;
};

// Version comparison function
export const compareVersions = (version1: string, version2: string): number => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
};

// Helper function to get store URL based on platform
export const getStoreUrl = (): string => {
  const { Platform } = require('react-native');
  return Platform.OS === 'ios' 
    ? FORCE_UPDATE_CONFIG.appStoreUrl || FORCE_UPDATE_CONFIG.playStoreUrl
    : FORCE_UPDATE_CONFIG.playStoreUrl;
}; 