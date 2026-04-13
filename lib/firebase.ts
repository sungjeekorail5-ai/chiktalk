import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 🚀 1. 이거 추가!

const firebaseConfig = {
  apiKey: "AIzaSyCP11ROhqyjzU55l1UOY2mSDyw_vCjO_zg",
  authDomain: "tristan-archive.firebaseapp.com",
  projectId: "tristan-archive",
  storageBucket: "tristan-archive.firebasestorage.app",
  messagingSenderId: "30520578201",
  appId: "1:30520578201:web:5b021b0b14d0a558fde808"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🚀 2. 이거 추가! (비밀번호 변경할 때 이 녀석이 꼭 필요합니다)
export const auth = getAuth(app); 

export const storage = getStorage(app);
export const db = getFirestore(app);