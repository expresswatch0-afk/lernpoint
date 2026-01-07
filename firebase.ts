// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAOYyruUeY1u5uQjIqbBoLJ0QrT7x5MfVE",
  authDomain: "ernypoint.firebaseapp.com",
  databaseURL: "https://ernypoint-default-rtdb.firebaseio.com",
  projectId: "ernypoint",
  storageBucket: "ernypoint.firebasestorage.app",
  messagingSenderId: "484427677328",
  appId: "1:484427677328:web:33464992d71d6624786215"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };