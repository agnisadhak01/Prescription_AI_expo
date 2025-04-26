import React from 'react';
import { View, StyleSheet } from 'react-native';
import Lottie from 'lottie-react';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Lottie
        animationData={require('../../assets/loading_animation.json')}
        loop
        autoplay
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lottie: { width: 200, height: 200 },
}); 