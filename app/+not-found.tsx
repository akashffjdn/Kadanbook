import { EmptyState, Screen } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { useStyles } from '@/lib/unistyles';

/**
 * 404 fallback for unknown deep links.
 * Design ref: GitHub 404 (friendly icon + clear CTA back home).
 */
export default function NotFoundRoute() {
  const router = useRouter();
  const { theme } = useStyles();
  return (
    <Screen padded edges={{ top: true, bottom: true }}>
      <EmptyState
        icon={<Compass size={36} color={theme.colors.text.secondary} />}
        title="Page not found"
        description="That link doesn't exist (anymore)."
        actionLabel="Go home"
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
