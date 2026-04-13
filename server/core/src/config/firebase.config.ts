import 'dotenv/config';
import * as admin from 'firebase-admin';

const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : admin.credential.applicationDefault();

export const firebaseConfig = {
  credential,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
};
