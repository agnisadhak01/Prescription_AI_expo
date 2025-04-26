import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Verify OTP</Text>
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Verify
      </Button>
      <Button mode="text" style={styles.button} onPress={() => {}}>
        Resend OTP
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginVertical: 4 },
}); 