// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlYbsBpvVankFj3uok4BJZ3VqiDvP4vRU",
  authDomain: "organic-store-2bb29.firebaseapp.com",
  projectId: "organic-store-2bb29",
  storageBucket: "organic-store-2bb29.firebasestorage.app",
  messagingSenderId: "792039189431",
  appId: "1:792039189431:web:ba9b6001c6e1fd51f69632",
  measurementId: "G-G8E61LNC9Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);