import { View, Text, TextInput, StyleSheet, ScrollView, Button } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const mockClubs = [
  { id: "1", name: "Chess Club", description: "A club for chess enthusiasts." },
  { id: "2", name: "Coding Club", description: "For coding challenges." },
];

export default function Tab() {
  const colorScheme = useColorScheme();
  const [clubs, setClubs] = useState(mockClubs);
  const router = useRouter();

  const handleJoin = (clubId: string) => {
    const joinedClub = clubs.find(club => club.id === clubId);
    if (joinedClub) {
      // Remove from explore
      setClubs(prev => prev.filter(club => club.id !== clubId));
      // Navigate to Clubs tab
      router.replace(`/(tabs)/(clubs)/clubs?joinedClub=${encodeURIComponent(JSON.stringify(joinedClub))}`);
      alert(`Joined ${clubId}!`);
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScrollView contentContainerStyle={[styles.container, { marginTop: 60 }]} testID='index-screen'>
        {clubs.map(club => (
          <View key={club.id} style={[styles.tile, styles.shadow, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <View style={styles.tileContent}>
              <View style={styles.circle}></View>
              <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>
                {club.name}
              </Text>
            </View>
            <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 18, padding: 10 }}>
              {club.description}
            </Text>
            <Button title="Join" onPress={() => handleJoin(club.id)} color={Colors[colorScheme ?? 'light'].tint} />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.search, { backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.8 }]}>
        <TextInput placeholder='Search' style={{ left: 20, color: Colors[colorScheme ?? 'light'].text }}></TextInput>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    tile: {
        height: 250, 
        flexDirection: 'column',
        width:'90%', 
        justifyContent: 'center', 
        marginTop: 20,
        borderRadius: 5,
    },
    tileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 10
    },
    circle: {
      height: 40,
      width: 40,
      borderRadius: 20,
      backgroundColor: '#888',
    },
    shadow: {
        shadowColor: '#00000088',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,  
        elevation: 5
    },
    search: {
      height: 50,
      width: "80%",
      alignSelf: "center",
      position: "absolute",
      justifyContent: 'center',
      margin: 15,
      borderRadius: 25,
    }

});