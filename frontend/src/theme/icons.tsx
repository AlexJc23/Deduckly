import NativeIonicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useAppTheme } from "./theme";
import { appearanceColor } from "./palette";
export const Ionicons = Object.assign(function ThemedIonicons({ color, ...props }: ComponentProps<typeof NativeIonicons>) {
    const { dark } = useAppTheme();
    return <NativeIonicons {...props} color={appearanceColor(color ?? "#273449", "color", dark)} />;
}, { glyphMap: NativeIonicons.glyphMap, font: NativeIonicons.font });
export default Ionicons;
