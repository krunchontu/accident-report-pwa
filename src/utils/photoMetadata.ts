export interface PhotoMetadata {
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  compassHeading: number | null;
}

export async function capturePhotoMetadata(): Promise<PhotoMetadata> {
  const timestamp = new Date().toISOString();
  let latitude: number | null = null;
  let longitude: number | null = null;
  let compassHeading: number | null = null;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      });
    });
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    compassHeading = position.coords.heading;
  } catch {
    // GPS not available
  }

  return { latitude, longitude, timestamp, compassHeading };
}

export function generateThumbnail(blob: Blob, maxWidth: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}
