import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  Notification, 
  getNotifications, 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
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
      const { error } = await markAllNotificationsAsRead();
      if (error) throw new Error(error);
      
      // Update local state to mark all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
        fetchUnreadCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
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
      markAllAsRead
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