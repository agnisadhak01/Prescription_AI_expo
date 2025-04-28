import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Linking, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { supabase } from '@/components/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import Modal from 'react-native-modal';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
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
  const [selectedPackage, setSelectedPackage] = useState<{scans: number, price: number} | null>(null);
  const scanPackages = [
    { scans: 5, price: 99 },
    { scans: 10, price: 179 },
    { scans: 20, price: 299 },
  ];

  // Fetch scans when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchScansRemaining();
      return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
      };
    }, [])
  );

  const fetchScansRemaining = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('scans_remaining')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setScansRemaining(data.scans_remaining);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const buyMoreScans = async () => {
    if (!user) return;
    setPaymentLoading(true);
    
    try {
      const response = await fetch(
        'https://fwvwxzvynfrqjvizcejf.functions.supabase.co/create-cashfree-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            email: user.email, 
            amount: 99 
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }
      
      if (data.payment_link) {
        Linking.openURL(data.payment_link);
        startPolling();
      } else {
        throw new Error('No payment link received');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert(
        'Payment Error',
        'Could not create payment. Please try again later.'
      );
      setPaymentLoading(false);
    }
  };

  const startPolling = () => {
    // Start polling for scan update
    pollInterval.current = setInterval(async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('scans_remaining')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data && data.scans_remaining > (scansRemaining || 0)) {
          // Payment success!
          setScansRemaining(data.scans_remaining);
          stopPolling();
          showSuccessState();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      stopPolling();
    }, 5 * 60 * 1000);
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
        await fetchScansRemaining();
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

  const handleBuyScans = (pkg: {scans: number, price: number}) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const confirmPurchase = async () => {
    if (!user || !selectedPackage) return;
    setPaymentLoading(true);
    try {
      const response = await fetch(
        'https://fwvwxzvynfrqjvizcejf.functions.supabase.co/create-cashfree-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            email: user.email, 
            amount: selectedPackage.price 
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }
      if (data.payment_link) {
        Linking.openURL(data.payment_link);
        startPolling();
        setModalVisible(false);
      } else {
        throw new Error('No payment link received');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Could not create payment. Please try again later.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>My Subscription</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Current Balance Card */}
        <LinearGradient
          colors={["#ffffff", "#f8f9fa", "#f0f4f8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceContent}>
            <Text style={styles.balanceTitle}>Available Scans</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
            ) : (
              <View style={styles.balanceValueContainer}>
                <Text style={styles.balanceValue}>{scansRemaining !== null ? scansRemaining : '--'}</Text>
                <Feather name="file-text" size={24} color="#4c669f" style={styles.balanceIcon} />
              </View>
            )}
            <Text style={styles.balanceDescription}>Each scan allows you to process one prescription</Text>
          </View>
        </LinearGradient>

        {/* Buy Scans Card */}
        <LinearGradient
          colors={["#ffffff", "#f8f9fa", "#f0f4f8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Feather name="shopping-cart" size={20} color="#4c669f" />
              <Text style={styles.cardTitle}>Buy More Scans</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.packageItem}>
                <View>
                  <Text style={styles.packageTitle}>5 Scan Package</Text>
                  <Text style={styles.packageDescription}>Purchase 5 more scans for your account</Text>
                </View>
                <Text style={styles.packagePrice}>₹99</Text>
              </View>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuyScans(scanPackages[0])}
                disabled={paymentLoading}
              >
                <LinearGradient
                  colors={paymentLoading ? ["#9aa0aa", "#7d8491"] : ["#4c669f", "#3b5998"]}
                  style={styles.buyButtonGradient}
                >
                  {paymentLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buyButtonText}>Processing Payment...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buyButtonText}>Purchase Now</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.morePackagesBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.morePackagesText}>See more packages</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Coupon Card */}
        <LinearGradient
          colors={["#ffffff", "#f8f9fa", "#f0f4f8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Feather name="gift" size={20} color="#4c669f" />
              <Text style={styles.cardTitle}>Redeem a Coupon</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChangeText={setCoupon}
                  autoCapitalize="characters"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[styles.applyButton, !coupon && { backgroundColor: '#ccc' }]}
                  onPress={handleApplyCoupon}
                  disabled={!coupon || loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.applyButtonText}>Apply</Text>}
                </TouchableOpacity>
              </View>
              {!!feedback && (
                <Text style={[styles.feedback, feedbackType === 'success' ? styles.success : styles.error]}>
                  {feedback}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Subscription Info */}
        <LinearGradient
          colors={["#ffffff", "#f8f9fa", "#f0f4f8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.infoCard]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Feather name="info" size={20} color="#4c669f" />
              <Text style={styles.cardTitle}>Subscription Info</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoItem}>
                <Feather name="check-circle" size={16} color="#43ea2e" />
                <Text style={styles.infoText}>New users get 3 scans for free</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="check-circle" size={16} color="#43ea2e" />
                <Text style={styles.infoText}>Each purchased package adds 5 scans</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="check-circle" size={16} color="#43ea2e" />
                <Text style={styles.infoText}>Scan balance never expires</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={60} color="#43ea2e" />
            </View>
            <Text style={styles.successText}>Success!</Text>
            <Text style={styles.successSubtext}>Your scan balance has been updated</Text>
          </View>
        </View>
      )}

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose a Scan Package</Text>
          {scanPackages.map((pkg, idx) => (
            <TouchableOpacity
              key={pkg.scans}
              style={[styles.packageOption, selectedPackage?.scans === pkg.scans && styles.selectedPackage]}
              onPress={() => setSelectedPackage(pkg)}
            >
              <Text style={styles.packageOptionText}>{pkg.scans} scans - ₹{pkg.price}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.confirmBtn, !selectedPackage && { backgroundColor: '#ccc' }]}
            onPress={confirmPurchase}
            disabled={!selectedPackage || paymentLoading}
          >
            {paymentLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Buy</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  balanceContent: {
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
    marginBottom: 12,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceIcon: {
    marginLeft: 12,
  },
  balanceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  cardBody: {
    paddingHorizontal: 4,
  },
  packageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 13,
    color: '#666',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  buyButton: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  buyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  applyButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 12,
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  loader: {
    marginVertical: 12,
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
  successText: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  feedback: { marginTop: 8, fontSize: 15, textAlign: 'center' },
  success: { color: '#43a047' },
  error: { color: '#d32f2f' },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  packageOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4c669f',
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
  },
  selectedPackage: {
    backgroundColor: '#e3eaff',
    borderColor: '#1976d2',
  },
  packageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  confirmBtn: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    width: 200,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#1976d2',
    fontSize: 16,
  },
  morePackagesBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  morePackagesText: {
    color: '#1976d2',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 