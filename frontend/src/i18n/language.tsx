import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Alert } from "react-native";
import { getLanguage, setRuntimeLanguage, subscribeLanguage, translate, type Language } from "./core";
const KEY = "deduckly.language";
let writes = Promise.resolve();
export function setLanguage(language: Language) {
  setRuntimeLanguage(language);
  writes = writes.then(() => AsyncStorage.setItem(KEY, language)).catch(() => {
    Alert.alert(translate("Language wasn’t saved"), translate("Your language changed for this session. Please try again to save it on this device."));
  });
}
export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
  const t = useCallback((text: string, params?: Record<string, string | number>) => translate(text, params, language), [language]);
  return { language, locale: language === "es" ? "es-US" : "en-US", setLanguage, t };
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(value => {
      if (active && (value === "en" || value === "es")) setRuntimeLanguage(value);
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  return ready ? children : null;
}
// Only app-owned copy is opted into translation. User text is never scanned.
export function Translated({ text, params }: { text: ReactNode; params?: Record<string, string | number> }) {
  const { t } = useLanguage();
  return typeof text === "string" ? t(text, params) : text;
}
