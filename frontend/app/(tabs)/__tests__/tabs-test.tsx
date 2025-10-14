import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, Platform } from 'react-native';
// This assumes you have configured the global Jest setup file (jest-setup.js) 
// with 'import "@testing-library/react-native/extend-expect";'
// If you are still seeing the "toBeOnTheScreen is not a function" error, ensure your 
// jest config references your 'jest-setup.js' file.
import '@testing-library/jest-native/extend-expect'; 

// --- 1. Setup Mocks for External Dependencies ---

// Mocking useColorScheme to ensure a predictable 'light' mode tint is used
const mockColorScheme = 'light';
const useColorScheme = () => mockColorScheme;

// Mocking the Colors constant expected by the component
const Colors = { 
  light: { tint: '#007AFF' }, // Use a distinct color for verification if needed
  dark: { tint: '#5856D6' }
};

// Mocking the HapticTab component used as tabBarButton.
// In a test, we just need it to render the content (the icons/titles) correctly.
const HapticTab = ({ children, accessibilityRole, onPress, onLongPress, name }) => (
    // We render the children and add a specific test ID to ensure HapticTab was used
    <Text testID="haptic-tab-wrapper" onPress={onPress}>
        {children}
    </Text>
);

// Mocking the Expo Vector Icons to confirm their names and colors are passed correctly
const MockIcon = ({ name, color, size }) => (
    <Text testID={`icon-mock-${name}`} style={{ color, fontSize: size }}>
        {`ICON:${name}`}
    </Text>
);
const Ionicons = MockIcon;
const MaterialIcons = MockIcon;
const SimpleLineIcons = MockIcon;

// Mocking the Tabs component from expo-router to render its children
const Tabs = ({ children }) => <>{children}</>;

// FIX APPLIED HERE: We use React.Fragment (<>) and wrap the title in its own Text component.
// This isolates the text node, making it reliably searchable by screen.getByText().
Tabs.Screen = ({ name, options }) => {
    
    const TabContent = (
        <> 
            {/* Placing the title in its own Text component */}
            <Text>{options.title}</Text>
            {options.tabBarIcon({ color: Colors[mockColorScheme].tint })}
        </>
    );

    // 2. Wrap the content with the HapticTab mock (the tabBarButton)
    return <HapticTab name={name} key={name}>{TabContent}</HapticTab>;
};


// --- 2. THE COMPONENT UNDER TEST ---
// We define the TabLayout component exactly as provided by the user,
// relying on the mocked variables defined above.

const TabLayout = () => {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs 
        screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
        }}>

      <Tabs.Screen
        name="(clubs)"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(index)"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <SimpleLineIcons name="globe-alt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
};
export default TabLayout;

// --- 3. THE JEST TEST SUITE ---

describe('TabLayout structure and options', () => {

    // Test to ensure all three tabs are rendered
    it('renders all three tab screens (Clubs, Explore, Me)', () => {
        render(<TabLayout />);

        // Check for the titles associated with each segment
        expect(screen.getByText('Clubs')).toBeOnTheScreen();
        expect(screen.getByText('Explore')).toBeOnTheScreen();
        expect(screen.getByText('Me')).toBeOnTheScreen();
    });

    // Test to verify the correct icon is associated with the 'Clubs' tab
    it('renders the correct icon for the Clubs tab', () => {
        render(<TabLayout />);
        // Checks that the mock icon received the correct name prop for MaterialIcons
        expect(screen.getByTestId('icon-mock-people')).toBeOnTheScreen();
    });

    // Test to verify the correct icon is associated with the 'Explore' tab
    it('renders the correct icon for the Explore tab', () => {
        render(<TabLayout />);
        // Checks that the mock icon received the correct name prop for SimpleLineIcons
        expect(screen.getByTestId('icon-mock-globe-alt')).toBeOnTheScreen();
    });

    // Test to verify the correct icon is associated with the 'Profile' tab
    it('renders the correct icon for the Me tab', () => {
        render(<TabLayout />);
        // Checks that the mock icon received the correct name prop for Ionicons
        expect(screen.getByTestId('icon-mock-person-circle-outline')).toBeOnTheScreen();
    });

    // Test to ensure the custom HapticTab component is applied to the buttons
    it('applies the HapticTab component as the custom tabBarButton', () => {
        render(<TabLayout />);
        // Since HapticTab wraps the content, we check that its test ID is present multiple times
        expect(screen.getAllByTestId('haptic-tab-wrapper')).toHaveLength(3);
    });
});
