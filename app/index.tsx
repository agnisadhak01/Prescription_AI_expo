import { Redirect } from 'expo-router';

export default function Index() {
  // This redirects any access to the root route to the LoginScreen
  // This works with our _layout.tsx approach to prevent unauthorized access
  return <Redirect href="/LoginScreen" />;
} 