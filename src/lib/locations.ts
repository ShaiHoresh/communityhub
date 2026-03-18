export type Location = {
  id: string;
  name: string;
  maxCapacity: number;
};

import { dbGetLocationById, dbGetLocations } from "@/lib/db-locations";

export async function getLocations(): Promise<Location[]> {
  return dbGetLocations();
}

export async function getLocationById(id: string): Promise<Location | undefined> {
  return dbGetLocationById(id);
}

