import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function Tab() {
  const colorScheme = useColorScheme()
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ScrollView contentContainerStyle={[styles.container, {marginTop: 60}]}>
            <View style={[styles.tile, {backgroundColor: Colors[colorScheme ?? 'light'].background}]}>
                <View style={styles.tileContent}>
                    <View style={styles.circle}></View>
                    <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 25, fontWeight: 'bold', textAlign: 'center'}}>Chess Club</Text>
                </View>
                <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 18, padding: 10}}>
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                </Text>
            </View>
        </ScrollView>
        <View style={[styles.search, {backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.8}]}>
          <TextInput placeholder='Search' style={{left: 20, color: Colors[colorScheme ?? 'light'].text}}></TextInput>
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
