import type { Location } from "@/lib/locations";

export const DEFAULT_LOCATIONS: Location[] = [
  { id: "main-hall", name: "אולם מרכזי", maxCapacity: 250, spaceCategory: "Indoor" },
  { id: "small-shul", name: "בית כנסת קטן", maxCapacity: 80, spaceCategory: "Indoor" },
  { id: "beit-midrash", name: "בית מדרש", maxCapacity: 60, spaceCategory: "Indoor" },
];

