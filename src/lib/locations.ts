export type Location = {
  id: string;
  name: string;
  maxCapacity: number;
  spaceCategory: "Indoor" | "Covered" | "OpenAir" | "Protected";
};

import { dbGetLocationById, dbGetLocations } from "@/lib/db-locations";

export async function getLocations(): Promise<Location[]> {
  return dbGetLocations();
}

export async function getLocationById(id: string): Promise<Location | undefined> {
  return dbGetLocationById(id);
}

