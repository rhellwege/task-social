import { View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  user: string;
  score: number;
}

interface ChatMessage {
  user: string;
  text: string;
}

export default function ClubDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Load mock data based on club ID
    setLeaderboard([
      { user: "User1", score: 100 },
      { user: "User2", score: 80 },
    ]);
    setChatMessages([
      { user: "User1", text: "Hello!" },
      { user: "User2", text: "Hi there!" },
    ]);
  }, [id]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 24 }}>Club ID: {id}</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20 }}>Leaderboard</Text>
        {leaderboard.map((entry, idx) => (
          <Text key={idx} style={{ color: Colors[colorScheme ?? 'light'].text }}>
            {entry.user}: {entry.score}
          </Text>
        ))}
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20 }}>Chat</Text>
        {chatMessages.map((msg, idx) => (
          <Text key={idx} style={{ color: Colors[colorScheme ?? 'light'].text }}>
            {msg.user}: {msg.text}
          </Text>
        ))}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});