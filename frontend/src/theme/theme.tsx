import { localizedAlert } from "@/i18n/alerts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import {  Appearance, Platform, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

export type AppearancePreference = "system" | "light" | "dark";
const STORAGE_KEY = "deduckly.appearance";
const ThemeContext = createContext({ dark: false, preference: "system" as AppearancePreference, setPreference: (_value: AppearancePreference) => {} });
export const useAppTheme = () => useContext(ThemeContext);
export function AppThemeProvider({ children }: { children: ReactNode }) {
    const system = useColorScheme();
    const writes = useRef(Promise.resolve());
    const [preference, setValue] = useState<AppearancePreference>("system");
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let active = true;
        AsyncStorage.getItem(STORAGE_KEY).then(value => {
            if (active && (value === "light" || value === "dark" || value === "system")) setValue(value);
        }).catch(() => {}).finally(() => { if (active) setReady(true); });
        return () => { active = false; };
    }, []);
    const dark = preference === "system" ? system === "dark" : preference === "dark";
    useEffect(() => { void SystemUI.setBackgroundColorAsync(dark ? "#101722" : "#F8FAFC").catch(() => {}); }, [dark]);
    function setPreference(value: AppearancePreference) {
        setValue(value);
        writes.current = writes.current.then(() => AsyncStorage.setItem(STORAGE_KEY, value)).catch(() => localizedAlert("Appearance wasn’t saved", "Your theme changed for this session. Please try again to save it on this device."));
    }
    useEffect(() => {
        if (Platform.OS !== "web") Appearance.setColorScheme(preference === "system" ? null : preference);
    }, [preference]);
    const base = dark ? DarkTheme : DefaultTheme;
    return <ThemeContext.Provider value={{ dark, preference, setPreference }}>
        <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: dark ? "#71C7F2" : "#0072B5", background: dark ? "#101722" : "#F8FAFC", card: dark ? "#1B2635" : "#FFFFFF", text: dark ? "#EDF3FA" : "#273449", border: dark ? "#344357" : "#E2E8F0" } }}>
            <StatusBar style={dark ? "light" : "dark"} />
            {ready ? children : null}
        </ThemeProvider>
    </ThemeContext.Provider>;
}
