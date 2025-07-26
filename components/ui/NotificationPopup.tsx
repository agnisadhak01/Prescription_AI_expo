import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useNotifications } from '../NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPopupProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { 
    notifications, 
    loading, 
    refreshing, 
    refreshNotifications, 
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Auto-refresh notifications when popup becomes visible
  useEffect(() => {
    if (visible) {
      if (__DEV__) console.log('Notification popup opened, refreshing notifications');
      // Only refresh if there are existing notifications or if the user deliberately opens the panel
      // This will reset the notificationsCleared flag and allow fetching again
      refreshNotifications();
    }
  }, [visible]);

  // Create a wrapper for markAllAsRead to provide visual feedback
  const handleMarkAllAsRead = async () => {
    if (isMarkingAllAsRead) return;
    
    setIsMarkingAllAsRead(true);
    try {
      await markAllAsRead();
    } finally {
      // Delay resetting the loading state to ensure animations complete
      setTimeout(() => {
        setIsMarkingAllAsRead(false);
      }, 1000);
    }
  };

  // Handle clear all notifications with confirmation
  const handleClearAll = () => {
    if (isClearing || notifications.length === 0) return;

    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              const success = await clearAllNotifications();
              if (success) {
                if (__DEV__) console.log('Successfully cleared all notifications');
              } else {
                console.error('Failed to clear all notifications');
                Alert.alert('Error', 'Failed to clear notifications. Please try again.');
              }
            } finally {
              setIsClearing(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatNotificationTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };
  
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'scan_quota':
        return <MaterialIcons name="file-copy" size={24} color={colors.primary} />;
      case 'login':
        return <MaterialIcons name="login" size={24} color="#4CAF50" />;
      case 'subscription':
        return <MaterialIcons name="card-membership" size={24} color="#FF9800" />;
      case 'suggestion':
        return <MaterialIcons name="lightbulb" size={24} color="#9C27B0" />;
      case 'system':
      default:
        return <MaterialIcons name="info" size={24} color="#2196F3" />;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
      <View style={styles.headerButtons}>
        {notifications.length > 0 && (
          <>
            <TouchableOpacity 
              onPress={handleMarkAllAsRead} 
              style={styles.markAllButton}
              disabled={isMarkingAllAsRead || notifications.every(n => n.is_read) || isClearing}
            >
              {isMarkingAllAsRead ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text 
                  style={[
                    styles.markAllText, 
                    { 
                      color: notifications.every(n => n.is_read) ? colors.border : colors.primary,
                      opacity: notifications.every(n => n.is_read) ? 0.5 : 1
                    }
                  ]}
                >
                  Mark all read
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleClearAll} 
              style={styles.clearAllButton}
              disabled={isClearing || isMarkingAllAsRead || notifications.length === 0}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#FF5252" />
              ) : (
                <Text style={[styles.clearAllText, { color: "#FF5252" }]}>
                  Clear All
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <MaterialIcons name="notifications-none" size={80} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.text }]}>
            We&apos;ll notify you about important updates and activity
          </Text>
        </>
      )}
    </View>
  );

  const handleNotificationPress = async (id: string) => {
    await markAsRead(id);
    // Additional logic could be added here to navigate to relevant screens
    // based on notification type and content
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.is_read ? colors.card : colors.background },
        !item.is_read && { borderLeftColor: colors.primary, borderLeftWidth: 4 }
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.iconContainer}>{renderNotificationIcon(item.type)}</View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.notificationMessage, { color: colors.text }]}>{item.message}</Text>
        <Text style={[styles.notificationTime, { color: colors.text }]}>
          {formatNotificationTime(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            {renderHeader()}
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContentContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshNotifications}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={renderEmptyList}
              onEndReached={loadMoreNotifications}
              onEndReachedThreshold={0.5}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
  },
  container: {
    maxHeight: height * 0.7,
    width: width > 500 ? 500 : width,
    alignSelf: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  clearAllButton: {
    marginRight: 16,
    minWidth: 75,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default NotificationPopup; 