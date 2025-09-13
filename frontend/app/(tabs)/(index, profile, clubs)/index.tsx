import { View, Text, TextInput, StyleSheet, ScrollView, Button } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState, useEffect } from 'react';

export default function Tab() {
  const colorScheme = useColorScheme();
  const [clubs, setClubs] = useState<{ id: string; name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const token = 'your-hardcoded-jwt-token-here'; // Replace with a valid token from backend or remove if not needed

  useEffect(() => {
    fetch('http://127.0.0.1:5050/clubs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setClubs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const handleJoin = async (clubId: string) => {
    const response = await fetch(`http://127.0.0.1:5050/clubs/${clubId}/join`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (response.ok) alert('Joined!');
    else alert('Failed to join');
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScrollView contentContainerStyle={[styles.container, { marginTop: 60 }]}>
        {clubs.map(club => (
          <View key={club.id} style={[styles.tile, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
