import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  Notification, 
  getNotifications, 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteAllNotifications
} from './NotificationService';
import { AppState, AppStateStatus } from 'react-native';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const { count, error } = await getUnreadNotificationsCount();
      if (error) throw new Error(error);
      
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async (reset = false) => {
    if (!user) return;

    try {
      setLoading(reset ? true : loading);
      const newOffset = reset ? 0 : offset;
      
      const { data, error } = await getNotifications(LIMIT, newOffset, true);
      if (error) throw new Error(error);
      
      if (data) {
        if (reset) {
          setNotifications(data);
        } else {
          setNotifications(prev => [...prev, ...data]);
        }
        
        setHasMore(data.length === LIMIT);
        setOffset(reset ? LIMIT : offset + LIMIT);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await fetchUnreadCount();
    await fetchNotifications(true);
  };

  const loadMoreNotifications = async () => {
    if (!loading && hasMore) {
      await fetchNotifications();
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { success, error } = await markNotificationAsRead(notificationId);
      if (error) throw new Error(error);
      
      if (success) {
        // Update local state to mark the notification as read
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (__DEV__) console.log('Marking all notifications as read...');
      const { error } = await markAllNotificationsAsRead();
      if (error) {
        console.error(`Error in markAllAsRead: ${error}`);
        return;
      }
      
      if (__DEV__) console.log('Successfully marked all notifications as read, refreshing state');
      // Update local state to mark all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      // Force a refresh of notifications after a short delay to ensure UI is updated
      setTimeout(() => {
        if (__DEV__) console.log('Performing delayed notification refresh after marking all as read');
        refreshNotifications();
      }, 500);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async (): Promise<boolean> => {
    try {
      if (__DEV__) console.log('Clearing all notifications...');
      const { success, error, count } = await deleteAllNotifications();
      
      if (error) {
        console.error(`Error in clearAllNotifications: ${error}`);
        return false;
      }
      
      if (__DEV__) console.log(`Successfully deleted ${count} notifications`);
      // Clear the local notifications array
      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch (error: any) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };

  // Initial fetching of notifications
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications(true);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setOffset(0);
      setHasMore(true);
    }
  }, [user]);

  // Setup app state change listener to refresh notifications when app is foregrounded
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        if (__DEV__) console.log('App came to foreground, refreshing notifications');
        // Refresh both unread count and full notifications list
        fetchUnreadCount();
        fetchNotifications(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Setup periodic refresh of notifications (every 60 seconds)
  useEffect(() => {
    if (!user) return;
    
    if (__DEV__) console.log('Setting up automatic notification refresh timer');
    const refreshInterval = setInterval(() => {
      if (__DEV__) console.log('Auto-refreshing notifications');
      fetchUnreadCount();
      fetchNotifications(true);
    }, 60000); // Refresh every 60 seconds
    
    return () => {
      if (__DEV__) console.log('Clearing notification refresh timer');
      clearInterval(refreshInterval);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshing,
      refreshNotifications,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 