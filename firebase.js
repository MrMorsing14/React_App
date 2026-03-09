// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "reactproject-d3bda.firebaseapp.com",
  projectId: "reactproject-d3bda",
  storageBucket: "reactproject-d3bda.firebasestorage.app",
  messagingSenderId: "440398452025",
  appId: "1:440398452025:web:d1018cc1616e5324e2c4e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);