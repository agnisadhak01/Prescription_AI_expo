import { supabase } from './supabaseClient';

export type NotificationType = 'scan_quota' | 'login' | 'subscription' | 'suggestion' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the user's notifications
 * @param limit Number of notifications to fetch
 * @param offset Pagination offset
 * @param includeRead Whether to include read notifications
 * @returns Notifications array or error
 */
export const getNotifications = async (
  limit = 20, 
  offset = 0, 
  includeRead = false
): Promise<{ data?: Notification[], error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('get_user_notifications', {
      fetch_limit: limit,
      fetch_offset: offset,
      include_read: includeRead
    });

    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { error: error.message || 'Failed to fetch notifications' };
  }
};

/**
 * Marks a specific notification as read
 * @param notificationId ID of the notification to mark as read
 * @returns Success status
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('mark_notification_read', {
      notification_id: notificationId
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message || 'Failed to mark notification as read' };
  }
};

/**
 * Marks all notifications as read
 * @returns Number of notifications marked as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ count?: number, error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('mark_all_notifications_read');

    if (error) throw error;
    return { count: data };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { error: error.message || 'Failed to mark notifications as read' };
  }
};

/**
 * Gets the count of unread notifications
 * @returns Count of unread notifications
 */
export const getUnreadNotificationsCount = async (): Promise<{ count?: number, error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('count_unread_notifications');

    if (error) throw error;
    return { count: data };
  } catch (error: any) {
    console.error('Error counting unread notifications:', error);
    return { error: error.message || 'Failed to count unread notifications' };
  }
};

/**
 * Creates a new notification for admin use
 * Normally notifications would be created by backend services/triggers/webhooks
 * This is provided for testing or manual notification creation
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  metadata?: Record<string, any>
): Promise<{ success: boolean, id?: string, error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('create_notification', {
      user_id: userId,
      title,
      message,
      notification_type: type,
      metadata: metadata ? JSON.stringify(metadata) : null
    });

    if (error) throw error;
    return { success: true, id: data };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message || 'Failed to create notification' };
  }
}; 