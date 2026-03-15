type HebcalItem = {
  title: string;
  category: string;
  date: string;
};

type HebcalResponse = {
  items: HebcalItem[];
};

type CachedHebcal = {
  key: string;
  fetchedAt: number;
  data: HebcalResponse;
};

// Simple in-memory, per-process cache. Good enough for a single Next.js instance.
let cache: CachedHebcal | null = null;

// GeoNames ID for Jerusalem. Replace with your community's location later if needed.
const DEFAULT_GEONAME_ID = "281184";

function makeCacheKey(date: Date, geonameId: string) {
  return `${date.toISOString().slice(0, 10)}::${geonameId}`;
}

export async function fetchHebcalShabbatForDate(
  date: Date,
  geonameId: string = DEFAULT_GEONAME_ID,
): Promise<HebcalResponse> {
  const key = makeCacheKey(date, geonameId);

  if (cache && cache.key === key) {
    return cache.data;
  }

  const url = new URL("https://www.hebcal.com/shabbat");
  url.searchParams.set("cfg", "json");
  url.searchParams.set("geonameid", geonameId);
  url.searchParams.set("M", "on");
  url.searchParams.set("leyning", "off");

  const res = await fetch(url.toString(), {
    // Let Next.js cache at the fetch level too, but we also keep our own per-process cache.
    next: {
      revalidate: 60 * 60 * 24, // 24 hours
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Hebcal data: ${res.status}`);
  }

  const data = (await res.json()) as HebcalResponse;
  cache = {
    key,
    fetchedAt: Date.now(),
    data,
  };

  return data;
}

export function extractShabbatTimes(items: HebcalItem[]) {
  const candles = items.find((i) => i.category === "candles");
  const havdalah = items.find((i) => i.category === "havdalah");

  return {
    candles,
    havdalah,
  };
}

