import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';
import { useAuth } from '../hooks/useAuth';

/**
 * CouponTestComponent - A temporary testing component for the coupon system
 * 
 * Instructions:
 * 1. Add this component to any screen temporarily for testing
 * 2. Run the tests in order
 * 3. Remove this component before production release
 * 
 * Usage:
 * import { CouponTestComponent } from '../components/CouponTestComponent';
 * // Add <CouponTestComponent /> to your render method
 */

export const CouponTestComponent: React.FC = () => {
  const { user, scansRemaining, refreshScansRemaining } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCouponRedemption = async (couponCode: string, expectedResult: string, testName: string) => {
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', {
        user_id: user.id,
        coupon_code: couponCode,
      });

      if (error) throw error;

      const passed = data === expectedResult;
      const result = `${testName}: ${passed ? '✅ PASS' : '❌ FAIL'} - Expected: ${expectedResult}, Got: ${data}`;
      addResult(result);
      
      if (data === 'success') {
        // Payment or coupon logic, refreshes scan quota
        await refreshScansRemaining();
      }

      return passed;
    } catch (error) {
      const result = `${testName}: ❌ ERROR - ${(error as Error).message}`;
      addResult(result);
      return false;
    }
  };

  const runAllTests = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    setIsRunning(true);
    clearResults();
    addResult('🧪 Starting Coupon System Tests...');
    addResult(`👤 Testing with user: ${user.email}`);
    addResult(`📊 Initial scan quota: ${scansRemaining}`);
    addResult('');

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Valid WELCOME5 coupon
    totalTests++;
    addResult('Test 1: Valid WELCOME5 Coupon');
    const quotaBefore = scansRemaining;
    if (await testCouponRedemption('WELCOME5', 'success', 'WELCOME5 Redemption')) {
      passedTests++;
      const quotaAfter = scansRemaining;
      addResult(`  📈 Quota change: ${quotaBefore} → ${quotaAfter} (+${quotaAfter - quotaBefore})`);
    }
    addResult('');

    // Test 2: Already used coupon
    totalTests++;
    addResult('Test 2: Already Used Coupon');
    if (await testCouponRedemption('WELCOME5', 'already_used', 'Already Used Check')) {
      passedTests++;
    }
    addResult('');

    // Test 3: Invalid coupon
    totalTests++;
    addResult('Test 3: Invalid Coupon');
    if (await testCouponRedemption('INVALID123', 'invalid_coupon', 'Invalid Coupon Check')) {
      passedTests++;
    }
    addResult('');

    // Test 4: Case insensitivity (if user hasn't used it yet)
    totalTests++;
    addResult('Test 4: Case Insensitivity');
    if (await testCouponRedemption('welcome5', 'already_used', 'Case Insensitive Check')) {
      passedTests++;
      addResult('  ℹ️ Case insensitive working (coupon already used as expected)');
    }
    addResult('');

    // Test 5: Empty coupon code (frontend validation)
    totalTests++;
    addResult('Test 5: Empty Input Validation');
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', {
        user_id: user.id,
        coupon_code: '',
      });
      if (data === 'invalid_coupon') {
        addResult('Empty Input: ✅ PASS - Correctly handled empty input');
        passedTests++;
             } else {
         addResult(`Empty Input: ❌ FAIL - Expected invalid_coupon, got: ${data}`);
       }
     } catch {
       addResult(`Empty Input: ❌ ERROR - Unknown error occurred`);
     }
    addResult('');

    // Summary
    addResult('📋 TEST SUMMARY');
    addResult(`Passed: ${passedTests}/${totalTests} tests`);
    addResult(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      addResult('🎉 ALL TESTS PASSED!');
    } else {
      addResult('⚠️ Some tests failed - check implementation');
    }

    setIsRunning(false);
  };

  const testQuotaRefresh = async () => {
    const quotaBefore = scansRemaining;
    addResult(`📊 Quota before refresh: ${quotaBefore}`);
    
    // Updates scan quota using global context
    await refreshScansRemaining();
    
    addResult(`📊 Quota after refresh: ${scansRemaining}`);
    addResult(quotaBefore === scansRemaining ? '✅ Quota consistent' : '⚠️ Quota changed');
  };

  const checkDatabaseState = async () => {
    try {
      // Check user's redemption history
      const { data, error } = await supabase
        .from('coupon_redemptions')
        .select(`
          id,
          redeemed_at,
          coupons (
            code,
            description,
            scan_amount
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

             addResult('🗃️ DATABASE STATE');
       addResult(`User redemptions: ${data.length}`);
       data.forEach((redemption: any) => {
         const coupon = redemption.coupons;
         addResult(`  • ${coupon.code}: ${coupon.scan_amount} scans`);
       });
     } catch (error) {
       addResult(`❌ Database check failed: ${(error as Error).message}`);
     }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Coupon Test Component</Text>
        <Text style={styles.error}>Please log in to test coupons</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Coupon System Tester</Text>
      <Text style={styles.subtitle}>Current Quota: {scansRemaining} scans</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testQuotaRefresh}
        >
          <Text style={styles.buttonText}>Test Quota Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={checkDatabaseState}
        >
          <Text style={styles.buttonText}>Check DB State</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  warningButton: {
    backgroundColor: '#f57c00',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  resultsContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 6,
    maxHeight: 300,
  },
  resultsTitle: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  resultText: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});

export default CouponTestComponent; 