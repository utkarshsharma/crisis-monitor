import { NextResponse } from "next/server";

export const revalidate = 300;

interface UsgsGeometry {
  coordinates: [number, number, number];
}

interface UsgsProperties {
  mag: number;
  place: string;
  time: number;
  url: string;
}

interface UsgsFeature {
  properties: UsgsProperties;
  geometry: UsgsGeometry;
}

interface UsgsResponse {
  features: UsgsFeature[];
}

export async function GET() {
  try {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0];

    const USGS_URL =
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&starttime=${threeDaysAgo}` +
      `&minmagnitude=3` +
      `&minlatitude=15&maxlatitude=45` +
      `&minlongitude=35&maxlongitude=70`;

    const response = await fetch(USGS_URL, {
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`USGS API responded with status ${response.status}`);
    }

    const data: UsgsResponse = await response.json();

    const earthquakes = (data.features ?? []).map((feature: UsgsFeature) => ({
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      time: feature.properties.time,
      url: feature.properties.url,
      coordinates: feature.geometry.coordinates,
    }));

    return NextResponse.json({ earthquakes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch earthquake data", details: message },
      { status: 500 }
    );
  }
}
