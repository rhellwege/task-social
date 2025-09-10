import { View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function Tab() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <View style={[styles.profileView, {backgroundColor: Colors[colorScheme ?? 'light'].background}]}>
          <View style={styles.circle}></View>
          <View style={styles.name}>
            <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 32}}>User</Text>
            <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 18, fontWeight: 200}}>@user</Text>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 24, }}>Edit Profile</Text>
          <View style={[styles.line, {borderBottomColor: Colors[colorScheme ?? 'light'].text}]}/>
          <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 24, }}>Account Settings</Text>
          <View style={[styles.line, {borderBottomColor: Colors[colorScheme ?? 'light'].text}]}/>
          <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 24, }}>App Settings</Text>
          <View style={[styles.line, {borderBottomColor: Colors[colorScheme ?? 'light'].text}]}/>
          <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 24, }}>Your Data</Text>
          <View style={[styles.line, {borderBottomColor: Colors[colorScheme ?? 'light'].text}]}/>
          <Text style={{color: Colors[colorScheme ?? 'light'].text, fontSize: 24, }}>Contact Us</Text>
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
  },
  profileView: {
    height: 80, width:'70%', 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 5,
    gap: 10
  },
  circle: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#888',
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: 250,
  },
  name: {
    width: "50%"
  }
});
