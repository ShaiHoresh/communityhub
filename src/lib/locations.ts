export type Location = {
  id: string;
  name: string;
  maxCapacity: number;
  spaceCategory: "Indoor" | "Covered" | "OpenAir" | "Protected";
};

import { DEFAULT_LOCATIONS } from "@/lib/default-locations";
import { dbEnsureLocations, dbGetLocationById, dbGetLocations } from "@/lib/db-locations";

export async function getLocations(): Promise<Location[]> {
  await dbEnsureLocations(DEFAULT_LOCATIONS);
  return dbGetLocations();
}

export async function getLocationById(id: string): Promise<Location | undefined> {
  await dbEnsureLocations(DEFAULT_LOCATIONS);
  return dbGetLocationById(id);
}

