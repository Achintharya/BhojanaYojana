/**
 * Root layout for Bhojana Yojana
 * Initializes database and sets up the app structure
 */
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { initializeDatabase } from '../src/database/db';
import { seedSampleData } from '../src/database/seedData';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Buntera-Demo': require('../assets/Buntera Demo.otf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize the database
        await initializeDatabase();
        
        // Seed sample data (only runs once)
        await seedSampleData();
        
        setIsReady(true);
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    prepare();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  if (!isReady || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing Bhojana Yojana...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
