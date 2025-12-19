import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwiQJA8eXiPwOHbEE3n6LXQiBPQ4aKdeo",
  authDomain: "daily-decision-helper.firebaseapp.com",
  projectId: "daily-decision-helper",
  storageBucket: "daily-decision-helper.firebasestorage.app",
  messagingSenderId: "1014204688750",
  appId: "1:1014204688750:web:a47a1bc9286f237e52397f",
  measurementId: "G-FP78ERW548"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
