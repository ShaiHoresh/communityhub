export type Location = {
  id: string;
  name: string;
  maxCapacity: number;
};

// In a real app this would be backed by a database table.
// For now we keep a small in-memory seed that behaves like a "locations" table.
export const LOCATIONS: Location[] = [
  {
    id: "main-hall",
    name: "אולם מרכזי",
    maxCapacity: 250,
  },
  {
    id: "small-shul",
    name: "בית כנסת קטן",
    maxCapacity: 80,
  },
  {
    id: "beit-midrash",
    name: "בית מדרש",
    maxCapacity: 60,
  },
];

export function getLocations(): Location[] {
  return LOCATIONS;
}

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.id === id);
}

