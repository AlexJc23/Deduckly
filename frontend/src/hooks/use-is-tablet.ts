import { useWindowDimensions } from "react-native";

export function useIsTablet() {
  const { width } = useWindowDimensions();

  return width >= 768;
}