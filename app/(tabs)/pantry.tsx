/**
 * Pantry screen
 * View and manage pantry inventory
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PantryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Track your pantry items, quantities, and expiry dates.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pantry Management</Text>
          <Text style={styles.placeholderText}>
            Features coming in next phase:
          </Text>
          <Text style={styles.bulletPoint}>• Add/edit pantry items</Text>
          <Text style={styles.bulletPoint}>• Set low-stock thresholds</Text>
          <Text style={styles.bulletPoint}>• Track expiry dates</Text>
          <Text style={styles.bulletPoint}>• View items by category</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginVertical: 4,
  },
});
