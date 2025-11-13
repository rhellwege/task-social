import { View, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Tab from '../(index, profile, clubs)/clubs'; //adjust path to clubs.tsx as needed
import ClubDetail from '../(index, profile, clubs)/club'; //adjust path to club.tsx as needed
import * as React from 'react';

//mock hooks and dependencies
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'), //default to light for consistency
}));

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const MockLink = ({ children, href, style, ...props }: { children?: React.ReactNode; href?: any; style?: any; [key: string]: any }) => (
    <View style={style} {...props}>
      {children}
    </View>
  );
  return {
    useLocalSearchParams: jest.fn(() => ({})), //default empty params
    useRouter: jest.fn(),
    Link: MockLink,
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(), //do not invoke callback to prevent render issues
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      text: '#000',
      background: '#fff',
    },
    dark: {
      text: '#fff',
      background: '#000',
    },
  }
}));

describe('Clubs Tab (Joined Clubs)', () => {
  beforeEach(() => {
    //reset mocks
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  test('renders "No clubs joined" when no clubs are present', async () => {
    render(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('No clubs joined')).toBeTruthy();
  });

  test('renders joined clubs as tiles with links', async () => {
    //mock params with a joined club
    const mockClub = {
      id: '1',
      name: 'Test Club',
      description: 'A test club',
      owner_user_id: 'user1',
      banner_image: null,
      is_public: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      joinedClub: encodeURIComponent(JSON.stringify(mockClub)),
    });

    render(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Test Club')).toBeTruthy();
  });

  test('handles multiple joined clubs without duplicates', async () => {
    const mockClub1 = {
      id: '1',
      name: 'Club One',
      description: 'First club',
      owner_user_id: 'user1',
      banner_image: null,
      is_public: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    const mockClub2 = {
      id: '2',
      name: 'Club Two',
      description: 'Second club',
      owner_user_id: 'user2',
      banner_image: null,
      is_public: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };

    //simulate adding clubs via params (first render adds one, then update)
    (useLocalSearchParams as jest.Mock).mockReturnValueOnce({
      joinedClub: encodeURIComponent(JSON.stringify(mockClub1)),
    }).mockReturnValueOnce({
      joinedClub: encodeURIComponent(JSON.stringify(mockClub2)),
    }).mockReturnValue({
      joinedClub: encodeURIComponent(JSON.stringify(mockClub1)),
    });

    const { rerender } = render(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club One')).toBeTruthy();

    //rerender to simulate param change for second club
    rerender(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club Two')).toBeTruthy();

    //rerender for duplicate
    rerender(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    const clubOnes = screen.getAllByText('Club One');
    expect(clubOnes.length).toBe(1);
  });

  test('applies dark theme correctly', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    render(
      <NavigationContainer>
        <ThemeProvider value={DarkTheme}>
          <Tab />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('No clubs joined')).toBeTruthy();
  });
});

describe('Club Detail Page', () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  test('renders club ID, leaderboard, and chat messages', async () => {
    render(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <ClubDetail />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club ID: 1')).toBeTruthy();
    expect(await screen.findByText('Leaderboard')).toBeTruthy();
    expect(await screen.findByText('User1: 100')).toBeTruthy();
    expect(await screen.findByText('User2: 80')).toBeTruthy();
    expect(await screen.findByText('Chat')).toBeTruthy();
    expect(await screen.findByText('User1: Hello!')).toBeTruthy();
    expect(await screen.findByText('User2: Hi there!')).toBeTruthy();
  });

  test('updates data based on club ID change', async () => {
    const { rerender } = render(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <ClubDetail />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club ID: 1')).toBeTruthy();

    //change ID
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '2' });
    rerender(
      <NavigationContainer>
        <ThemeProvider value={DefaultTheme}>
          <ClubDetail />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club ID: 2')).toBeTruthy();
    //note: since mock data is static, leaderboard/chat remain the same; in real app, this would fetch new data
  });

  test('applies dark theme correctly', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    render(
      <NavigationContainer>
        <ThemeProvider value={DarkTheme}>
          <ClubDetail />
        </ThemeProvider>
      </NavigationContainer>
    );

    expect(await screen.findByText('Club ID: 1')).toBeTruthy();
    //additional style assertions can be added if needed
  });
});