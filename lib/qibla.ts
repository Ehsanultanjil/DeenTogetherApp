import { Linking, Platform } from 'react-native';

// Coordinates of the Holy Kaaba in Makkah
export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

/**
 * Calculates the forward azimuth / bearing from the user's coordinates to the Kaaba in degrees (0..360)
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const phi1 = (latitude * Math.PI) / 180;
  const lambda1 = (longitude * Math.PI) / 180;
  const phi2 = (KAABA_COORDS.latitude * Math.PI) / 180;
  const lambda2 = (KAABA_COORDS.longitude * Math.PI) / 180;

  const dLambda = lambda2 - lambda1;
  const y = Math.sin(dLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

/**
 * Calculates great-circle distance to Makkah in kilometers using the Haversine formula
 */
export function calculateDistanceToMakkah(latitude: number, longitude: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((KAABA_COORDS.latitude - latitude) * Math.PI) / 180;
  const dLon = ((KAABA_COORDS.longitude - longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((KAABA_COORDS.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Opens Google Maps or the system Maps app searching for nearby mosques centered on user coords
 */
export async function openNearbyMosques(latitude?: number | null, longitude?: number | null) {
  const lat = latitude ?? 23.8103;
  const lng = longitude ?? 90.4125;

  const geoUrl = `geo:${lat},${lng}?q=mosque`;
  const webUrl = `https://www.google.com/maps/search/mosque/@${lat},${lng},15z`;

  try {
    if (Platform.OS === 'android') {
      const canOpen = await Linking.canOpenURL(geoUrl);
      if (canOpen) {
        await Linking.openURL(geoUrl);
        return;
      }
    }
    await Linking.openURL(webUrl);
  } catch {
    await Linking.openURL(webUrl).catch(() => {});
  }
}

