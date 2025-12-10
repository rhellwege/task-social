import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { allClubs } from './mockData';
import type { Club } from './types';

export default function CreateClub() {
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a club name.');
      return;
    }

    const newId = Date.now().toString();
    const newClub: Club = {
      id: newId,
      name: name.trim(),
      description: description.trim(),
      owner_user_id: 'current_user', //currently dummy; replace later
      banner_image: null,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allClubs.push(newClub);
    setName('');
    setDescription('');
    router.push({ pathname: '/clubs', params: { refresh: Date.now().toString() } });
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: '#ccc' }]}
          placeholder="Club Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text, borderColor: '#ccc' }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FFFFFF' }]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>Create Club</Text>
        </TouchableOpacity>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});