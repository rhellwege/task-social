import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';

export default function Tab() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ScrollView contentContainerStyle={styles.container}>
            <Link style={[styles.tile, styles.shadow, {backgroundColor: Colors[colorScheme ?? 'light'].background}]} href="/club">
                <View style={styles.tileContent}>
                    <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>Chess Club</Text>
                </View>
            </Link>
        </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    tile: {
        height: 200, 
        width:'90%', 
        justifyContent: 'center', 
        marginTop: 20,
        borderRadius: 5,
    },
    tileContent: {
        alignItems: 'center',
        padding: 10
    },
    shadow: {
        shadowColor: '#00000088',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,  
        elevation: 5
    }
});
