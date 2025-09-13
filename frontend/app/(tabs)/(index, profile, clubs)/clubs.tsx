import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';

export default function Tab() {
  const colorScheme = useColorScheme();
  const [joinedClubs, setJoinedClubs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const token = 'your-hardcoded-jwt-token-here'; // Replace or remove if not needed

  useEffect(() => {
    fetch('http://127.0.0.1:5050/user/clubs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setJoinedClubs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScrollView contentContainerStyle={styles.container}>
        {joinedClubs.length === 0 ? (
          <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 18, textAlign: 'center' }}>
            No clubs joined
          </Text>
        ) : (
          joinedClubs.map(club => (
            <Link
              key={club.id}
              href={{ pathname: '/club', params: { id: club.id } }}
              style={[styles.tile, styles.shadow, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            >
              <View style={styles.tileContent}>
                <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                  {club.name}
                </Text>
              </View>
            </Link>
          ))
        )}
      </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  tile: {
    height: 200,
    width: '90%',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 5,
  },
  tileContent: {
    alignItems: 'center',
    padding: 10,
  },
  shadow: {
    shadowColor: '#00000088',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});