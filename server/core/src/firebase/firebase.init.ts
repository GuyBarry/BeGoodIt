import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  const credential = serviceAccountPath
    ? admin.credential.cert(path.resolve(serviceAccountPath))
    : admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firebaseApp = admin.app();
