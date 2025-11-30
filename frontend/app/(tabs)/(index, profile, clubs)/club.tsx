import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

interface Listing {
  id: string;
  title: string;
  price: string;
  seller: string;
}

export default function ClubDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    // Replace old dummy leaderboard/chat with marketplace listings
    setListings([
      { id: "1", title: "Chess Set - Like New", price: "$40", seller: "alex123" },
      { id: "2", title: "Mechanical Keyboard", price: "$85", seller: "coder_in_cave" },
      { id: "3", title: "Used Nintendo Switch", price: "$220", seller: "gamer4life" },
      { id: "4", title: "Python Books Bundle", price: "$25", seller: "py_dev" },
      { id: "5", title: "Monitor 24\" 144Hz", price: "$150", seller: "techdude" },
    ]);
  }, [id]);

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.listingItem}>
      <Text style={styles.listingTitle}>
        {item.title}
      </Text>
      <Text style={styles.listingPrice}>
        {item.price}
      </Text>
      <Text style={{ color: '#888', fontSize: 14 }}>
        by {item.seller}
      </Text>
    </View>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>
          Club Marketplace
        </Text>
        
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ color: '#888', fontSize: 16 }}>No items for sale yet!</Text>
          }
        />

        {/* Optional: Add a little "Post Item" button later */}
        <TouchableOpacity style={styles.postButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>+ Post Item for Sale</Text>
        </TouchableOpacity>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  listingItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postButton: {
    marginTop: 20,
    backgroundColor: '#0066ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },

  listingTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  listingPrice: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
});