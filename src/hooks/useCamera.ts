import { useState, useCallback, useRef } from 'react';
import { capturePhotoMetadata, generateThumbnail } from '../utils/photoMetadata';
import type { PhotoMetadata } from '../utils/photoMetadata';

interface CameraResult {
  blob: Blob;
  thumbnail: string;
  metadata: PhotoMetadata;
}

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolveRef = useRef<((result: CameraResult | null) => void) | null>(null);

  const capture = useCallback((): Promise<CameraResult | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      if (!inputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        document.body.appendChild(input);
        inputRef.current = input;
      }

      const input = inputRef.current;

      const handleChange = async () => {
        setIsCapturing(true);
        try {
          const file = input.files?.[0];
          if (!file) {
            resolveRef.current?.(null);
            return;
          }

          const blob = file;
          const [metadata, thumbnail] = await Promise.all([
            capturePhotoMetadata(),
            generateThumbnail(blob),
          ]);

          resolveRef.current?.({ blob, thumbnail, metadata });
        } catch {
          resolveRef.current?.(null);
        } finally {
          setIsCapturing(false);
          input.value = '';
        }
      };

      const handleCancel = () => {
        setTimeout(() => {
          if (!input.files?.length) {
            resolveRef.current?.(null);
          }
        }, 500);
      };

      input.onchange = handleChange;
      input.addEventListener('cancel', handleCancel, { once: true });
      input.click();
    });
  }, []);

  return { capture, isCapturing };
}
