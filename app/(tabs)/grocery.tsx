/**
 * Grocery List screen
 * View and manage shopping list
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function GroceryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Your smart grocery list - automatically updated from pantry and meal plans.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grocery List Features</Text>
          <Text style={styles.placeholderText}>
            Features coming in next phase:
          </Text>
          <Text style={styles.bulletPoint}>• Auto-add low-stock items</Text>
          <Text style={styles.bulletPoint}>• Auto-add ingredients for planned meals</Text>
          <Text style={styles.bulletPoint}>• Mark items as purchased</Text>
          <Text style={styles.bulletPoint}>• Manual item addition</Text>
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
