import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    // Middle East bounding box: lat 15-45, lon 35-70
    const res = await fetch(
      "https://opensky-network.org/api/states/all?lamin=15&lamax=45&lomin=35&lomax=70",
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OpenSky API: ${res.status}`);
    const data = await res.json();

    // OpenSky returns states as arrays: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
    const aircraft = (data.states ?? [])
      .map((s: (string | number | boolean | null)[]) => ({
        icao24: s[0],
        callsign: (s[1] as string)?.trim() || "UNKNOWN",
        country: s[2],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7], // meters
        onGround: s[8],
        velocity: s[9], // m/s
        heading: s[10], // degrees from north
        verticalRate: s[11],
        squawk: s[14],
      }))
      .filter(
        (a: { latitude: number | null; longitude: number | null }) =>
          a.latitude != null && a.longitude != null
      );

    return NextResponse.json({ aircraft, timestamp: data.time });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch flights", details: message },
      { status: 500 }
    );
  }
}
