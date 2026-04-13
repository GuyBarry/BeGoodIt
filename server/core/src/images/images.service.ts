import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FirebaseStorageClient } from '../firebase/firebase.storage';

export interface UploadResult {
  url: string;
  fileName: string;
}

export class ImagesService {
  constructor(private readonly storageClient: FirebaseStorageClient) {}

  async processImage(buffer: Buffer, _mimeType: string): Promise<Buffer> {
    return buffer;
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    const processedBuffer = await this.processImage(file.buffer, file.mimetype);

    const extension = path.extname(file.originalname) || this.extensionFromMime(file.mimetype);
    const fileName = `images/${uuidv4()}${extension}`;

    const url = await this.storageClient.uploadFile(
      processedBuffer,
      fileName,
      file.mimetype
    );

    return { url, fileName };
  }

  private extensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[mimeType] || '.bin';
  }
}
