import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { allClubs, joinedClubs } from '../mockData';

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
  const params = useLocalSearchParams();
  const [displayedClubs, setDisplayedClubs] = useState<Club[]>([]);
  const { joinedClub } = params;

  const computeDisplayedClubs = () => {
    const owned = allClubs.filter(c => c.owner_user_id === 'current_user');
    const combined = [...owned, ...joinedClubs];
    const unique = combined.filter((c, index) => combined.findIndex(d => d.id === c.id) === index);
    setDisplayedClubs(unique);
  };

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
      if (!joinedClubs.find(c => c.id === clubData.id)) {
        joinedClubs.push(clubData);
      }
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
      computeDisplayedClubs();
    }, [joinedClub, handleClubParam])
  );

  // Initial compute
  useEffect(() => {
    computeDisplayedClubs();
  }, []);

  // Handle refresh param
  useEffect(() => {
    if (params.refresh) {
      computeDisplayedClubs();
    }
  }, [params.refresh]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScrollView contentContainerStyle={styles.container}>
        {displayedClubs.length === 0 ? (
          <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 18, textAlign: 'center' }}>
            No clubs joined
          </Text>
        ) : (
          displayedClubs.map(club => (
            <Link
              key={club.id}
              href={{ pathname: '/club', params: { id: club.id } }}
              style={[styles.tile, styles.shadow, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            >
              <View style={styles.tileContent}>
                <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
                  {club.name}
                </Text>
                <Text style={{
                  color: Colors[colorScheme ?? 'light'].text,
                  fontSize: 14,
                  opacity: 0.7,
                  textAlign: 'center',
                  marginTop: 6
                }}>
                  Marketplace • Buy & Sell
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