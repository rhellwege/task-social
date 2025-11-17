import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
  const { joinedClub } = useLocalSearchParams();

  const handleClubParam = useCallback((clubParam: string | string[] | undefined) => {
    if (!clubParam) return;
    let clubData: Club;
    try {
      if (typeof clubParam === 'string') {
        clubData = JSON.parse(decodeURIComponent(clubParam)) as Club;
      } else if (Array.isArray(clubParam)) {
        clubData = JSON.parse(decodeURIComponent(clubParam[0])) as Club;
      } else {
        return;
      }
      setJoinedClubs(prev => {
        if (!prev.find(c => c.id === clubData.id)) {
          return [...prev, clubData];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error parsing joinedClub:', error);
    }
  }, []);

  // Handle initial navigation
  useEffect(() => {
    handleClubParam(joinedClub);
  }, [joinedClub, handleClubParam]);

  // Handle tab focus
  useFocusEffect(
    useCallback(() => {
      handleClubParam(joinedClub);
    }, [joinedClub, handleClubParam])
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScrollView contentContainerStyle={styles.container} testID='clubs-screen'>
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