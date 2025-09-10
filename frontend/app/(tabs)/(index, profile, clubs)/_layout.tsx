import { Stack } from "expo-router"
import { useMemo } from "react"

const Layout = ({ segment }: { segment: string }) => {
    const rootScreen = useMemo(() => {
        switch (segment) {
            case '(clubs)':
                return <Stack.Screen name="clubs" options={{ title: 'Clubs'}} />
            case '(index)':
                return <Stack.Screen name="index" options={{ title: 'Home'}} />
            case '(profile)':
                return <Stack.Screen name="profile" options={{ title: 'Profile'}} />
        }
    }, [segment])

    return (
        <Stack>
            {rootScreen}
            <Stack.Screen name="club" options={{ title: 'Club'}} />
        </Stack>
    )
}

export default Layout