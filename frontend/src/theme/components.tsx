import { createContext, useContext, forwardRef } from "react";
import * as RN from "react-native";
import { SafeAreaView as NativeSafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "./theme";
import { appearanceColor } from "./palette";

export function themedStyle(style: any, dark: boolean): any {
    if (!dark || !style) return style;
    const flat = RN.StyleSheet.flatten(style);
    if (!flat) return flat;
    return Object.fromEntries(Object.entries(flat).map(([key, value]) => [key, key.endsWith("Color") || key === "color" ? appearanceColor(value, key, dark) : value]));
}
export const View = forwardRef<RN.View, RN.ViewProps>(function ThemeView({ style, ...props }, ref) {
    const { dark } = useAppTheme();
    return <RN.View ref={ref} {...props} style={themedStyle(style, dark)} />;
});
const TextColorContext = createContext<RN.ColorValue | undefined>(undefined);
export const Text = forwardRef<RN.Text, RN.TextProps>(function ThemeText({ style, ...props }, ref) {
    const { dark } = useAppTheme();
    const inheritedColor = useContext(TextColorContext);
    const resolvedStyle = themedStyle(style, dark);
    const color = RN.StyleSheet.flatten(resolvedStyle)?.color ?? inheritedColor ?? (dark ? "#EDF3FA" : "#273449");
    return <TextColorContext.Provider value={color}><RN.Text ref={ref} {...props} style={[{ color }, resolvedStyle]} /></TextColorContext.Provider>;
});
export const TextInput = forwardRef<RN.TextInput, RN.TextInputProps>(function ThemeInput({ style, placeholderTextColor, ...props }, ref) {
    const { dark } = useAppTheme();
    return <RN.TextInput ref={ref} keyboardAppearance={dark ? "dark" : "light"} {...props} placeholderTextColor={appearanceColor(placeholderTextColor ?? "#64748B", "color", dark)} style={[{ color: dark ? "#EDF3FA" : "#273449" }, themedStyle(style, dark)]} />;
});
export const Pressable = forwardRef<RN.View, RN.PressableProps>(function ThemePressable({ style, ...props }, ref) {
    const { dark } = useAppTheme();
    return <RN.Pressable ref={ref} {...props} style={typeof style === "function" ? state => themedStyle(style(state), dark) : themedStyle(style, dark)} />;
});
export const ScrollView = forwardRef<RN.ScrollView, RN.ScrollViewProps>(function ThemeScroll({ style, contentContainerStyle, ...props }, ref) {
    const { dark } = useAppTheme();
    return <RN.ScrollView ref={ref} indicatorStyle={dark ? "white" : "black"} {...props} style={themedStyle(style, dark)} contentContainerStyle={themedStyle(contentContainerStyle, dark)} />;
});
export const SafeAreaView = forwardRef<RN.View, React.ComponentProps<typeof NativeSafeAreaView>>(function ThemeSafeArea({ style, ...props }, ref) {
    const { dark } = useAppTheme();
    return <NativeSafeAreaView ref={ref} {...props} style={themedStyle(style, dark)} />;
});
export const TouchableOpacity = forwardRef<RN.View, RN.TouchableOpacityProps>(function ThemeTouchable({ style, ...props }, ref) {
    const { dark } = useAppTheme();
    return <RN.TouchableOpacity ref={ref} {...props} style={themedStyle(style, dark)} />;
});
export const AnimatedView = RN.Animated.createAnimatedComponent(View);
export const AnimatedText = RN.Animated.createAnimatedComponent(Text);
// Value and type exports preserve existing refs when migrating component imports.
// eslint-disable-next-line @typescript-eslint/no-redeclare -- component value and native instance type intentionally share a public name
export type View = RN.View;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- component value and native instance type intentionally share a public name
export type Text = RN.Text;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- component value and native instance type intentionally share a public name
export type TextInput = RN.TextInput;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- component value and native instance type intentionally share a public name
export type ScrollView = RN.ScrollView;
