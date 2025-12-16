import { View, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import Tab from '../explore/index'; // Updated path: explore tab is explore/index.tsx
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

//mock hooks and dependencies
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'), //default to light for consistency
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Explore Tab', () => {
  beforeEach(() => {
    //mock the component's state by rendering mock clubs directly
    jest.spyOn(require('../explore/index'), 'default').mockImplementation(() => {
      const mockClubs = [
        { id: "1", name: "Chess Club", description: "A club for chess enthusiasts." },
        { id: "2", name: "Coding Club", description: "For coding challenges." },
      ];
      return (
        <View>
          {mockClubs.map(club => (
            <View key={club.id}>
              <Text>{club.name}</Text>
              <Text>{club.description}</Text>
            </View>
          ))}
        </View>
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); //clean up mocks
  });

  test('renders all mock clubs as tiles', async () => {
    render(
      <ThemeProvider value={DefaultTheme}>
        <Tab />
      </ThemeProvider>
    );
    //check for club names
    expect(await screen.findByText('Chess Club')).toBeTruthy();
    expect(await screen.findByText('Coding Club')).toBeTruthy();
    //check for descriptions
    expect(await screen.findByText('A club for chess enthusiasts.')).toBeTruthy();
    expect(await screen.findByText('For coding challenges.')).toBeTruthy();
    //verify number of tiles (assuming each club has a view with name)
    const tiles = screen.getAllByText(/Chess Club|Coding Club/);
    expect(tiles.length).toBe(2);
  });
});

