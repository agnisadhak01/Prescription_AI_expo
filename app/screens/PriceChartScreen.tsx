import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function PriceChartScreen() {
  // Placeholder for chart and medication details
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Price Comparison Chart</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Chart will be displayed here.</Text>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Medication details will be displayed here.</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { textAlign: 'center', marginBottom: 16 },
  card: { marginBottom: 16 },
}); 