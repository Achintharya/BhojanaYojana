/**
 * Home/Dashboard screen
 * Overview of pantry, upcoming meals, and prep tasks
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Bhojana Yojana</Text>
        <Text style={styles.subtitle}>Your household meal planning companion</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.placeholderText}>
            This is the home screen where you'll see:
          </Text>
          <Text style={styles.bulletPoint}>• Items low in stock</Text>
          <Text style={styles.bulletPoint}>• Items expiring soon</Text>
          <Text style={styles.bulletPoint}>• Upcoming meals</Text>
          <Text style={styles.bulletPoint}>• Today's prep tasks</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <Text style={styles.placeholderText}>
            Coming soon: Quick overview of your pantry, meals, and nutrition
          </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
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
