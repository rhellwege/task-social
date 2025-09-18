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
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTc1ODI0NDY1OH0.8d9OYNNEDHYeEJW_DTExarVrGBTdKFv8lJz41c9cehA';

  useEffect(() => {
    fetch(`http://127.0.0.1:5050/api/club/${id}/leaderboard`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: LeaderboardEntry[]) => setLeaderboard(data));
    fetch(`http://127.0.0.1:5050/api/club/${id}/chat`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: ChatMessage[]) => setChatMessages(data));
  }, [id]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 24 }}>Club ID: {id}</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20 }}>Leaderboard</Text>
        {leaderboard.map((entry, idx) => <Text key={idx}>{entry.user}: {entry.score}</Text>)}
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 20 }}>Chat</Text>
        {chatMessages.map((msg, idx) => <Text key={idx}>{msg.user}: {msg.text}</Text>)}
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