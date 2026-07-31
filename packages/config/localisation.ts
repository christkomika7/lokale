import type { CityType } from "../lib/validator/localisation";

export const CITY_TYPE_LABELS: Record<CityType, string> = {
  CAPITAL: "Capitale",
  METROPOLIS: "Métropole",
  CITY: "Ville",
  TOWN: "Bourg",
  VILLAGE: "Village",
  HAMLET: "Hameau",
  SUBURB: "Banlieue",
  INDUSTRIAL_ZONE: "Zone industrielle",
  COMMERCIAL_ZONE: "Zone commerciale",
  TOURIST_AREA: "Zone touristique",
  PORT_CITY: "Ville portuaire",
  BORDER_CITY: "Ville frontalière",
};

export const CITY_TYPE_CLASS: Record<CityType, string> = {
  CAPITAL:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  METROPOLIS: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  CITY: "bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-400",
  TOWN: "bg-slate-100 text-slate-500 dark:bg-neutral-700/40 dark:text-neutral-500",
  VILLAGE:
    "bg-slate-100 text-slate-500 dark:bg-neutral-700/40 dark:text-neutral-500",
  HAMLET:
    "bg-slate-100 text-slate-400 dark:bg-neutral-700/30 dark:text-neutral-500",
  SUBURB:
    "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  INDUSTRIAL_ZONE:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  COMMERCIAL_ZONE:
    "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  TOURIST_AREA:
    "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  PORT_CITY: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  BORDER_CITY: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
};

export const CONTINENTS = [
  "Afrique",
  "Europe",
  "Amérique du Nord",
  "Amérique du Sud",
  "Asie",
  "Océanie",
] as const;

export const CITY_TYPES = Object.keys(CITY_TYPE_LABELS) as CityType[];

export const SORTABLE_FIELDS = [
  "name",
  "code",
  "continent",
  "phoneCode",
] as const;
