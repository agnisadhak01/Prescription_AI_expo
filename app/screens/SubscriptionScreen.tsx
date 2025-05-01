import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, StatusBar, Image, BackHandler } from 'react-native';
import { supabase } from '@/components/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import * as Linking from 'expo-linking';
import DisclaimerComponent from '@/components/ui/DisclaimerComponent';

// JavaScript to inject into WebView to detect JSON responses
const INJECTED_JAVASCRIPT = `
  (function() {
    // Function to check if text is JSON and contains success indicators
    function checkForSuccessJson(text) {
      try {
        // Try to parse as JSON
        const json = JSON.parse(text);
        
        // Only detect COMPLETED transactions
        // Must have both success=true AND scan_quota fields
        const isSuccess = 
          (json.success === true && json.scan_quota !== undefined) ||
          (json.success === true && json.message && json.message === "Transaction already processed");
          
        if (isSuccess) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_success',
            data: json
          }));
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    
    // Check page content on load - with specific text filtering
    setTimeout(() => {
      const body = document.body.textContent || '';
      checkForSuccessJson(body.trim());
      
      // Much more specific text detection - must have exact phrase
      if (body.includes('Transaction already processed') && 
          body.includes('scan_quota')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'payment_success_text',
          data: 'Transaction completed'
        }));
      }
    }, 1000);
    
    // Monitor DOM changes for JSON responses
    const observer = new MutationObserver(function(mutations) {
      const body = document.body.textContent || '';
      checkForSuccessJson(body.trim());
    });
    
    observer.observe(document.body, { 
      childList: true,
      subtree: true,
      characterData: true
    });
    
    true; // Return true to avoid console errors
  })();
`;

export default function SubscriptionScreen() {
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paymentDetectedRef = useRef(false);

  // Handle hardware back button to force close payment screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showWebView || showSuccess) {
        handlePaymentCompletion();
        return true; // Prevents default back behavior
      }
      return false; // Let default back behavior happen
    });

    return () => backHandler.remove();
  }, [showWebView, showSuccess]);

  // Register for payment result deep link handling
  useEffect(() => {
    // This handler will be called when the app is opened via deep link
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith('prescription-ai://payment-result')) {
        const url = new URL(event.url);
        const status = url.searchParams.get('status');
        
        // Mark payment as detected to prevent duplicate handling
        paymentDetectedRef.current = true;
        
        // Always close WebView
        setShowWebView(false);
        setPaymentLoading(false);
        
        if (status === 'success') {
          // Payment was successful - refresh quota and redirect immediately
          refreshScansRemaining();
          handlePaymentCompletion(true);
        } else {
          // Payment failed or was cancelled - just redirect
          handlePaymentCompletion(false);
          if (status === 'error') {
            Alert.alert('Payment Error', 'There was an issue with the payment.');
          } else if (status === 'failed') {
            Alert.alert('Payment Failed', 'Your payment was not successful.');
          } else if (status === 'cancelled') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          }
        }
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
      // Clear any remaining timeouts when component unmounts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Handle payment completion - call this function when payment is done (success or failure)
  const handlePaymentCompletion = (isSuccess = false) => {
    // Clear any existing timeouts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    // Close any open modals
    setShowWebView(false);
    setPaymentLoading(false);
    
    // If payment was successful, refresh quota
    if (isSuccess) {
      refreshScansRemaining();
    }
    
    // Always redirect to home immediately 
    navigateToHome();
  };

  // Fetch scans when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("SUBSCRIPTION SCREEN FOCUSED");
      
      // Reset payment detection state on screen focus
      paymentDetectedRef.current = false;
      
      // Always refresh scan quota when screen is focused
      if (user) {
        refreshScansRemaining();
      }
      
      return () => {
        // Clean up resources when screen loses focus
        if (pollInterval.current) clearInterval(pollInterval.current);
        if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      };
    }, [])
  );

  const showSuccessState = () => {
    setShowSuccess(true);
    setPaymentComplete(true);
    
    // Force redirect after 2 seconds as a fallback
    redirectTimeoutRef.current = setTimeout(() => {
      if (!paymentDetectedRef.current) {
        navigateToHome();
      }
    }, 2000);
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
        
        // Show success state briefly then redirect
        showSuccessState();
        handlePaymentCompletion(true);
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
    
    // Set a timeout to force close payment if it takes too long (5 minutes max)
    redirectTimeoutRef.current = setTimeout(() => {
      // Force redirect if payment takes too long
      if (showWebView) {
        setShowWebView(false);
        setPaymentLoading(false);
        Alert.alert('Payment Timeout', 'The payment process is taking too long. Please try again.');
        navigateToHome();
      }
    }, 300000); // 5 minutes timeout
  };

  // Navigate to home screen with fallback
  const navigateToHome = () => {
    try {
      router.replace('/');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/');
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const { data } = event.nativeEvent;
      console.log('WebView message received:', data);
      
      const message = JSON.parse(data);
      
      // Strict validation to prevent false positives
      if (message.type === 'payment_success') {
        // Validate that this is a real completed transaction
        const jsonData = message.data;
        if (!jsonData || (typeof jsonData !== 'object')) return;
        
        // Only accept messages with scan_quota or exact transaction processed message
        if (!(jsonData.scan_quota !== undefined || 
            (jsonData.message === "Transaction already processed" && jsonData.success === true))) {
          console.log('Ignoring non-final payment message');
          return;
        }
        
        console.log('CONFIRMED payment success detected in WebView content');
        
        // Mark as detected to prevent duplicate handling
        paymentDetectedRef.current = true;
        
        // Close WebView and handle completion
        setShowWebView(false);
        setPaymentLoading(false);
        
        // Show a success message
        Alert.alert(
          'Payment Successful', 
          'Your transaction was successfully processed.'
        );
        
        // Refresh scan quota and navigate home
        refreshScansRemaining();
        handlePaymentCompletion(true);
      } 
      else if (message.type === 'payment_success_text' && 
               message.data === 'Transaction completed') {
        // Only accept our specific success message
        console.log('CONFIRMED payment success text detected');
        
        if (!paymentDetectedRef.current) {
          paymentDetectedRef.current = true;
          
          // Close WebView and handle completion
          setShowWebView(false);
          setPaymentLoading(false);
          
          // Show a success message
          Alert.alert(
            'Payment Successful', 
            'Your transaction was successfully processed.'
          );
          
          // Refresh scan quota and navigate home
          refreshScansRemaining();
          handlePaymentCompletion(true);
        }
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {showSuccess && (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={60} color="#43ea2e" style={styles.successIcon} />
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successSubtext}>Your scans have been added.</Text>
            </View>
          )}

          {!showSuccess && (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Buy Scan Credits</Text>
                <Text style={styles.headerSubtitle}>
                  Add scan credits to your account to continue using the app
                </Text>
              </View>
              
              {/* Add medical disclaimer */}
              <DisclaimerComponent type="medical" compact={true} style={styles.disclaimer} />

              <View style={styles.quoteContainer}>
                <Text style={styles.quotaAvailable}>
                  Scans Available: {scansRemaining !== null ? scansRemaining : '...'}
                </Text>
              </View>

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

              {/* Add payment disclaimer */}
              <DisclaimerComponent type="payment" style={styles.disclaimer} />
              
              <View style={styles.complianceNotice}>
                <Text style={styles.complianceText}>
                  Payments are for scan quota credits only, not for clinical services. 
                  All purchases are processed in compliance with Google Play's billing policy.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

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
              injectedJavaScript={INJECTED_JAVASCRIPT}
              onMessage={handleWebViewMessage}
              onShouldStartLoadWithRequest={(event) => {
                // Handle UPI deeplinks
                if (event.url.startsWith('upi://')) {
                  Linking.openURL(event.url).catch(() => {
                    Alert.alert('Error', 'No UPI app found to handle the payment.');
                  });
                  return false; // Prevent WebView from loading this URL
                }
                
                // Detect payment completion in the URL
                const paymentCompletePatterns = [
                  'payment-success', 'status=success', '/success',
                  'payment-failure', 'status=failed', '/failed',
                  'payment-cancelled', 'status=cancelled', '/cancelled'
                ];
                
                if (paymentCompletePatterns.some(pattern => event.url.includes(pattern))) {
                  // Don't block loading but schedule completion handler
                  setTimeout(() => {
                    const isSuccess = event.url.includes('success');
                    handlePaymentCompletion(isSuccess);
                  }, 500);
                }
                
                return true;
              }}
              onNavigationStateChange={(navState) => {
                // More comprehensive payment status detection
                const url = navState.url;
                console.log('Navigation state changed:', url);
                
                // Success detection
                if (url.includes('payment-success') || 
                    url.includes('status=success') || 
                    url.includes('/success')) {
                  
                  console.log('Payment success detected in URL');
                  
                  // If we haven't already handled this payment
                  if (!paymentDetectedRef.current) {
                    paymentDetectedRef.current = true;
                    
                    // Update scan quota and redirect
                    refreshScansRemaining();
                    handlePaymentCompletion(true);
                  }
                } 
                // Failure detection
                else if (url.includes('payment-failure') ||
                         url.includes('status=failed') || 
                         url.includes('/failed') ||
                         url.includes('status=failure') || 
                         url.includes('/failure')) {
                         
                  console.log('Payment failure detected in URL');
                  
                  if (!paymentDetectedRef.current) {
                    paymentDetectedRef.current = true;
                    handlePaymentCompletion(false);
                  }
                } 
                // Cancellation detection
                else if (url.includes('payment-cancelled') ||
                         url.includes('status=cancelled') || 
                         url.includes('/cancelled') ||
                         url.includes('status=cancel') || 
                         url.includes('/cancel')) {
                         
                  console.log('Payment cancellation detected in URL');
                  
                  if (!paymentDetectedRef.current) {
                    paymentDetectedRef.current = true;
                    handlePaymentCompletion(false);
                  }
                }
              }}
              // Force reload to ensure JavaScript injection works
              cacheEnabled={false}
              incognito={true}
            />
          </View>
        </Modal>
      </SafeAreaView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  quotaAvailable: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pricingCard: {
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
  successContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  successSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
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
  disclaimer: {
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  complianceNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  complianceText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
});