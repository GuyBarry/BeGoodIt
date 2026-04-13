import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../serviceAccountKey.json';

export const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
};
