import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProcessingResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  // The OCR result is passed as a JSON string in params.result
  let result = null;
  try {
    result = params.result ? JSON.parse(params.result as string) : null;
  } catch {
    result = params.result || null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Result</Text>
      <ScrollView style={styles.resultBox}>
        <Text selectable style={styles.resultText}>
          {result ? JSON.stringify(result, null, 2) : 'No result data.'}
        </Text>
      </ScrollView>
      <Button title="Back to Home" onPress={() => router.replace('/(tabs)/PrescriptionsScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafd',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#4c669f',
  },
  resultBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultText: {
    fontFamily: 'monospace',
    color: '#222',
    fontSize: 15,
  },
}); 