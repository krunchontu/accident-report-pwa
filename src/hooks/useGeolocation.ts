import { useState, useCallback } from 'react';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  roadName: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null, longitude: null,
    address: '', roadName: '',
    loading: false, error: null,
  });

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'SGAccidentKaki/1.0' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const road = data.address?.road || data.address?.pedestrian || '';
      setState(prev => ({
        ...prev,
        address: data.display_name || '',
        roadName: road,
      }));
    } catch {
      // Offline — address will be looked up later
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;
      setState(prev => ({ ...prev, latitude, longitude, loading: false }));
      reverseGeocode(latitude, longitude);
    } catch (err) {
      setState(prev => ({
        ...prev, loading: false,
        error: err instanceof GeolocationPositionError
          ? err.message : 'Failed to get location',
      }));
    }
  }, [reverseGeocode]);

  return { ...state, getCurrentPosition, reverseGeocode };
}
