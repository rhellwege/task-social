import { Redirect } from 'expo-router';

export default function RootIndex() {
  // This component will automatically redirect to the 'explore' tab.
  // The '(tabs)' group segment is omitted from the path.
  return <Redirect href="/explore" />;
}
