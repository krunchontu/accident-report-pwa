import { useState, useCallback, useRef, useEffect } from 'react';
import { capturePhotoMetadata, generateThumbnail } from '../utils/photoMetadata';
import type { PhotoMetadata } from '../utils/photoMetadata';

export interface CameraResult {
  blob: Blob;
  thumbnail: string;
  metadata: PhotoMetadata;
}

type CaptureMode = 'camera' | 'gallery';

export function useCamera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const resolveRef = useRef<((result: CameraResult | null) => void) | null>(null);

  // Clean up DOM elements on unmount
  useEffect(() => {
    return () => {
      if (cameraInputRef.current) {
        cameraInputRef.current.remove();
        cameraInputRef.current = null;
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.remove();
        galleryInputRef.current = null;
      }
    };
  }, []);

  const capture = useCallback((mode: CaptureMode = 'camera'): Promise<CameraResult | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      const inputRef = mode === 'camera' ? cameraInputRef : galleryInputRef;

      if (!inputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (mode === 'camera') {
          input.capture = 'environment';
        }
        // Gallery mode: no capture attribute, so the OS shows the full file picker
        input.style.display = 'none';
        document.body.appendChild(input);
        inputRef.current = input;
      }

      const input = inputRef.current;

      const handleChange = async () => {
        input.onchange = null;
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

      input.onchange = handleChange;
      input.click();

      // iOS Safari may not fire onchange when the user cancels the file picker.
      // Detect cancellation via window re-focus after a delay.
      const onFocus = () => {
        setTimeout(() => {
          // If no file was selected after regaining focus, treat as cancel
          if (input.files?.length === 0 && resolveRef.current) {
            input.onchange = null;
            resolveRef.current(null);
            resolveRef.current = null;
          }
        }, 500);
      };
      window.addEventListener('focus', onFocus, { once: true });
    });
  }, []);

  return { capture, isCapturing };
}
