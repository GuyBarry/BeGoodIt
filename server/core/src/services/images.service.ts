import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FirebaseStorageClient } from '../firebase/firebase.storage';

const storageClient = new FirebaseStorageClient();

export interface UploadResult {
  url: string;
  fileName: string;
}

const extensionFromMime = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] || '.bin';
};

const processImage = async (buffer: Buffer, _mimeType: string): Promise<Buffer> => {
  return buffer;
};

const uploadImage = async (file: Express.Multer.File): Promise<UploadResult> => {
  const processedBuffer = await processImage(file.buffer, file.mimetype);

  const extension = path.extname(file.originalname) || extensionFromMime(file.mimetype);
  const fileName = `images/${uuidv4()}${extension}`;

  const url = await storageClient.uploadFile(
    processedBuffer,
    fileName,
    file.mimetype
  );

  return { url, fileName };
};

export const imagesService = {
  processImage,
  uploadImage,
};
