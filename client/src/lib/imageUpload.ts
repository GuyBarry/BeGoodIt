// Shared image upload constraints. Keep MAX_IMAGE_SIZE_BYTES in sync with the
// server-side limit in server/core/src/middlewares/images.middleware.ts.
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const IMAGE_TOO_LARGE_EVENT = 'begoodit:image-too-large';

export const isImageTooLarge = (file: File): boolean => file.size > MAX_IMAGE_SIZE_BYTES;

export const emitImageTooLarge = (): void => {
  window.dispatchEvent(new Event(IMAGE_TOO_LARGE_EVENT));
};
