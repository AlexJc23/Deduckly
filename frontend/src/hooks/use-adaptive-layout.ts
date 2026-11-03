import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adaptiveLayout } from './adaptive-layout';

/** Window and safe-area changes update layout only; no persistent or tracking state. */
export function useAdaptiveLayout() {
  const { width, height, fontScale, scale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return { ...adaptiveLayout(width, height, insets), fontScale, scale };
}
