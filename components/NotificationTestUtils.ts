import { supabase } from './supabaseClient';
import { createNotification } from './NotificationService';

/**
 * Generates test notifications for the current user
 * This is only for development and testing purposes
 */
export const generateTestNotifications = async (userId: string): Promise<{ success: boolean, error?: string }> => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Sample notifications data
    const notificationsData = [
      {
        title: 'Welcome to Prescription AI',
        message: 'Thank you for using our app! We hope it helps you manage your prescriptions efficiently.',
        type: 'system'
      },
      {
        title: 'Scan Quota Updated',
        message: 'You have 5 scans remaining. Visit the subscription page to add more scans.',
        type: 'scan_quota'
      },
      {
        title: 'Login Detected',
        message: 'A new login was detected on your account from a new device.',
        type: 'login'
      },
      {
        title: 'Subscription Reminder',
        message: 'Running low on scans? Subscribe to our premium plan for unlimited scans!',
        type: 'subscription'
      },
      {
        title: 'Tips for Better Scans',
        message: 'For better scan results, ensure good lighting and a flat surface when taking photos of prescriptions.',
        type: 'suggestion'
      }
    ];

    // Create notifications in the database
    for (const notif of notificationsData) {
      await createNotification(
        userId,
        notif.title,
        notif.message,
        notif.type as any,
        { generated: 'test' }
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error generating test notifications:', error);
    return { success: false, error: error.message || 'Failed to generate test notifications' };
  }
};

/**
 * Deletes all notifications for testing purposes
 * This is only for development and testing
 */
export const clearAllNotifications = async (userId: string): Promise<{ success: boolean, error?: string }> => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    return { success: false, error: error.message || 'Failed to clear notifications' };
  }
}; 