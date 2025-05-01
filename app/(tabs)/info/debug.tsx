import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DebugScreen() {
  const router = useRouter();

  // Test all possible navigation patterns
  const navigateToTerms = (method: string) => {
    console.log(`Trying to navigate using method: ${method}`);
    
    try {
      switch(method) {
        case 'absolute':
          router.navigate('/terms-of-service' as any);
          break;
        case 'relative':
          router.navigate('terms-of-service' as any);
          break;
        case 'tabs-structure':
          router.navigate('/(tabs)/info/terms-of-service' as any);
          break;
        case 'push-absolute':
          router.push('/terms-of-service' as any);
          break;
        case 'push-relative':
          router.push('terms-of-service' as any);
          break;
        case 'push-tabs-structure':
          router.push('/(tabs)/info/terms-of-service' as any);
          break;
        case 'replace':
          router.replace('terms-of-service' as any);
          break;
      }
    } catch (error) {
      console.error(`Navigation error (${method}):`, error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Navigation Screen</Text>
      <Text style={styles.description}>If you can see this, the Debug screen works!</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Try Different Navigation Methods</Text>
        <Text style={styles.infoText}>We'll attempt to navigate to Terms of Service using different methods:</Text>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 1: Absolute Path with navigate()</Text>
          <Button 
            title="Navigate - /terms-of-service" 
            onPress={() => navigateToTerms('absolute')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 2: Relative Path with navigate()</Text>
          <Button 
            title="Navigate - terms-of-service" 
            onPress={() => navigateToTerms('relative')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 3: Full structure with navigate()</Text>
          <Button 
            title="Navigate - /(tabs)/info/terms-of-service" 
            onPress={() => navigateToTerms('tabs-structure')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 4: Absolute Path with push()</Text>
          <Button 
            title="Push - /terms-of-service" 
            onPress={() => navigateToTerms('push-absolute')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 5: Relative Path with push()</Text>
          <Button 
            title="Push - terms-of-service" 
            onPress={() => navigateToTerms('push-relative')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 6: Full structure with push()</Text>
          <Button 
            title="Push - /(tabs)/info/terms-of-service" 
            onPress={() => navigateToTerms('push-tabs-structure')}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Text style={styles.methodTitle}>Method 7: Using replace()</Text>
          <Button 
            title="Replace - terms-of-service" 
            onPress={() => navigateToTerms('replace')}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Troubleshooting Tips</Text>
        <Text style={styles.troubleshootText}>1. Check if files are in the correct location</Text>
        <Text style={styles.troubleshootText}>2. Make sure screens are registered in _layout.tsx</Text>
        <Text style={styles.troubleshootText}>3. Try restarting the Expo server with --clear</Text>
        <Text style={styles.troubleshootText}>4. Check for import errors in screen files</Text>
        <Text style={styles.troubleshootText}>5. Look at console output for errors</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: 'green',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 16,
  },
  troubleshootText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  }
}); 