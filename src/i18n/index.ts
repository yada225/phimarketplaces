import { createContext, useContext } from "react";
import { fr, type Translations } from "./fr";
import { en } from "./en";

export type Lang = "fr" | "en";

const translations: Record<Lang, Translations> = { fr, en };

export const getTranslations = (lang: Lang): Translations => translations[lang];

interface I18nContextType {
  lang: Lang;
  t: Translations;
}

export const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  t: fr,
});

export const useI18n = () => useContext(I18nContext);
