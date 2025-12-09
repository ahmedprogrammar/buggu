
// This file is ready for your Firebase credentials.
// For now, the app uses 'services/db.ts' which simulates a database using LocalStorage
// so you can test the full functionality immediately without configuration.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// To enable real Firebase:
// 1. Run: npm install firebase
// 2. Uncomment the initialization code below
// 3. Update services/db.ts to use these Firestore instances

/*
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
*/
