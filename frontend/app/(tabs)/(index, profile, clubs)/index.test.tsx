import { render, screen } from '@testing-library/react-native';
import Tab from './index'; //adjust path if needed
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
    //mock the component's state
    jest.spyOn(require('./index'), 'default').mockImplementation(() => {
      const mockClubs = [
        { id: "1", name: "Chess Club", description: "A club for chess enthusiasts." },
        { id: "2", name: "Coding Club", description: "For coding challenges." },
      ];
      return { clubs: mockClubs, setClubs: jest.fn() };
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