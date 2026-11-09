import { useWindowDimensions } from "react-native";
import { EXPANDED_WIDTH } from './adaptive-layout';

// Legacy name: this is a live width hint, not physical tablet detection.
// Keep existing screens' breakpoint; new layouts can use useAdaptiveLayout.
export function useIsTablet() {
  const { width } = useWindowDimensions();

  return width >= EXPANDED_WIDTH;
}
