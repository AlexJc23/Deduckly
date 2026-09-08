import { spanish } from "./es";

export type Language = "en" | "es";

let language: Language = "en";

const listeners = new Set<() => void>();

export const getLanguage = () => language;

export const getLocale = () =>
  language === "es" ? "es-US" : "en-US";

export function setRuntimeLanguage(value: Language) {
  if (language === value) return;

  language = value;
  listeners.forEach((listener) => listener());
}

export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

const normalize = (value: string) =>
  value
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");

const catalog = new Map(
  Object.entries(spanish).map(([key, value]) => [
    normalize(key),
    value,
  ])
);

export function translate(
  value: string,
  params?: Record<string, string | number>,
  selectedLanguage: Language = language
): string {
  let output =
    selectedLanguage === "es"
      ? catalog.get(normalize(value)) ?? value
      : value;

  if (
    selectedLanguage === "es" &&
    output !== value &&
    value === value.toUpperCase()
  ) {
    output = output.toLocaleUpperCase("es-US");
  }

  if (params) {
    output = output.replace(
      /\{(\w+)\}/g,
      (match, key) =>
        params[key] === undefined
          ? match
          : String(params[key])
    );
  }

  return output;
}