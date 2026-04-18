import * as admin from 'firebase-admin';
import { firebaseConfig } from '../config/firebase.config';

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

export const firebaseApp = admin.app();
