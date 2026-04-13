import { getStorage } from 'firebase-admin/storage';
import { firebaseApp } from './firebase.init';

export class FirebaseStorageClient {
  private bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>;

  constructor() {
    this.bucket = getStorage(firebaseApp).bucket();
  }

  async uploadFile(
    buffer: Buffer,
    destination: string,
    mimeType: string
  ): Promise<string> {
    const file = this.bucket.file(destination);

    await file.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });

    await file.makePublic();

    return `https://storage.googleapis.com/${this.bucket.name}/${destination}`;
  }

  async getFileUrl(filePath: string): Promise<string> {
    const file = this.bucket.file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    return `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const file = this.bucket.file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    await file.delete();
  }
}
