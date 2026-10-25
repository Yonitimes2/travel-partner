import type { Lang } from "../types";
import { en } from "./en";
import { he, type Dict } from "./he";

export type { Dict };

export const LANGS: Lang[] = ["he", "en"];
export const DEFAULT_LANG: Lang = "he";

export const isLang = (value: string): value is Lang => (LANGS as string[]).includes(value);

export const dictionaries: Record<Lang, Dict> = { he, en };

export const dirOf = (lang: Lang) => (lang === "he" ? "rtl" : "ltr");
