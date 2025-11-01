import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

interface Club {
  id: string;
  name: string;
  description: string;
  owner_user_id: string;
  banner_image: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function Tab() {
  const colorScheme = useColorScheme();
  const [joinedClubs, setJoinedClubs] = useState<Club[]>([]);
  const { joinedClub } = useLocalSearchParams(); // Returns string | string[] | undefined

  useEffect(() => {
    if (joinedClub) {
      const clubData = typeof joinedClub === 'string' ? JSON.parse(joinedClub) : joinedClub;
      setJoinedClubs(prev => [...prev, clubData as Club]);
    }
  }, [joinedClub]);

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