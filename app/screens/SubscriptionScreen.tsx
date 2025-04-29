import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Linking, ActivityIndicator, ScrollView, StatusBar, Image } from 'react-native';
import { supabase } from '@/components/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function SubscriptionScreen() {
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  // Register for payment result deep link handling
  useEffect(() => {
    // This handler will be called when the app is opened via deep link
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith('prescription-ai://payment-result')) {
        const url = new URL(event.url);
        const status = url.searchParams.get('status');
        
        if (status === 'success') {
          // Payment was successful
          refreshScansRemaining();
          showSuccessState();
        } else if (status === 'error') {
          const message = url.searchParams.get('message') || 'An error occurred during payment';
          Alert.alert('Payment Error', message);
        } else if (status === 'failed') {
          Alert.alert('Payment Failed', 'Your payment was not successful. Please try again.');
        } else if (status === 'cancelled') {
          Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
        }
        setShowWebView(false);
        setPaymentLoading(false);
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
      // Remove listener when component unmounts
      // Note: Modern React Native doesn't require removing the listener
    };
  }, []);

  // Fetch scans when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("SUBSCRIPTION SCREEN UPDATED VERSION FOCUSED");
      return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
      };
    }, [])
  );

  const buyScans = async () => {
    if (!user) return;
    setPaymentLoading(true);
    try {
      // Call the PayU button generation endpoint
      const response = await fetch(
        'https://fwvwxzvynfrqjvizcejf.functions.supabase.co/create-payu-button',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            email: user.email, 
            amount: 149,
            name: "5 Prescription Scans",
            // Custom redirect URLs can be provided here if needed
            // successUrl: "...",
            // cancelUrl: "...",
            // failureUrl: "..."
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment button');
      }
      
      // Store the HTML button in state
      if (data.button_html) {
        setPaymentUrl(data.button_html);
        setShowWebView(true);
      } else {
        throw new Error('No payment button received');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert(
        'Payment Error',
        'Could not create payment button. Please try again later.'
      );
      setPaymentLoading(false);
    }
  };

  const startPolling = () => {
    pollInterval.current = setInterval(async () => {
      if (!user) return;
      try {
        await refreshScansRemaining();
        // If scansRemaining increased, stop polling and show success
        stopPolling();
        showSuccessState();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
    setTimeout(() => {
      stopPolling();
    }, 300000);
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
      setPaymentLoading(false);
    }
  };

  const showSuccessState = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
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
        showSuccessState();
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
    setPaymentUrl('https://u.payu.in/xIvM3doxpKpS');
    setShowWebView(true);
    setPaymentLoading(true);
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RECHARGE SCANS</Text>
          <View style={{width: 24}} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
          <Text style={{height: 0, width: 0}} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{''}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Get More Scans</Text>
          {scansRemaining !== null && (
            <Text style={styles.scanBalance}>
              Current balance: <Text style={styles.scanCount}>{scansRemaining} scans</Text>
            </Text>
          )}
          
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
            {paymentLoading ? (
              <View style={styles.buttonContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.payNowText, {marginLeft: 10}]}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <Text style={styles.payNowText}>Buy Now</Text>
                <Text style={styles.poweredByText}>Powered By PayU</Text>
              </View>
            )}
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
        </View>
      </SafeAreaView>

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <MaterialIcons name="check-circle" size={60} color="#43ea2e" style={styles.successIcon} />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successSubtext}>Your scans have been added to your account.</Text>
          </View>
        </View>
      )}

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
            onShouldStartLoadWithRequest={(event) => {
              if (event.url.startsWith('upi://')) {
                Linking.openURL(event.url).catch(() => {
                  Alert.alert('Error', 'No UPI app found to handle the payment.');
                });
                return false; // Prevent WebView from loading this URL
              }
              return true;
            }}
            onNavigationStateChange={(navState) => {
              // Monitor navigation to detect success/failure/cancel
              console.log('Navigation state changed:', navState.url);
              if (navState.url.includes('prescription-ai://payment-result')) {
                setShowWebView(false);
                setPaymentLoading(false);
                // Updates scan quota using global context
                refreshScansRemaining();
                showSuccessState();
              } else if (
                navState.url.includes('status=success') || 
                navState.url.includes('status=failed') || 
                navState.url.includes('status=cancelled') || 
                navState.url.includes('status=cancel')
              ) {
                // This will be handled by the deep link handler
                console.log('Payment status detected in URL:', navState.url);
              }
            }}
          />
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  scanBalance: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanCount: {
    fontWeight: 'bold',
    color: '#fff',
  },
  pricingCard: {
    width: '100%',
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
  priceSubtext: {
    fontSize: 16,
    fontWeight: 'normal',
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
  },
  buttonContainer: {
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  poweredByText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
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
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  successIcon: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  successSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
});