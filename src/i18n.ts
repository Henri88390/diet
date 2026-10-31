import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { en } from "./i18n-en";
import { fr } from "./i18n-fr";
import { de } from "./i18n-de";
import { es } from "./i18n-es";
import { ru } from "./i18n-ru";
import { pl } from "./i18n-pl";
import { translateTitle, translateUnit } from "./foodNames";

export type LanguageCode = "en" | "fr" | "de" | "es" | "ru" | "pl";

export const languages: { code: LanguageCode; name: string; locale: string; flag: string }[] = [
  { code: "en", name: "English", locale: "en-US", flag: "🇬🇧" },
  { code: "fr", name: "Français", locale: "fr-FR", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", locale: "de-DE", flag: "🇩🇪" },
  { code: "es", name: "Español", locale: "es-ES", flag: "🇪🇸" },
  { code: "ru", name: "Русский", locale: "ru-RU", flag: "🇷🇺" },
  { code: "pl", name: "Polski", locale: "pl-PL", flag: "🇵🇱" }
];

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    ru: { translation: ru },
    pl: { translation: pl }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export function useDateLocale(): string {
  const { i18n: instance } = useTranslation();
  return languages.find((language) => language.code === instance.language)?.locale ?? "en-US";
}

export function useFoodNames(): { food: (name: string) => string; unit: (unit: string) => string } {
  const { i18n: instance } = useTranslation();
  return {
    food: (name) => translateTitle(name, instance.language),
    unit: (unit) => translateUnit(unit, instance.language)
  };
}

export default i18n;
