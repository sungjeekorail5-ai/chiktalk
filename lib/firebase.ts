import { initializeApp, getApps, getApp } from "firebase/app"; // getApps, getApp 추가
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCP11ROhqyjzU55l1UOY2mSDyw_vCjO_zg",
  authDomain: "tristan-archive.firebaseapp.com",
  projectId: "tristan-archive",
  storageBucket: "tristan-archive.firebasestorage.app",
  messagingSenderId: "30520578201",
  appId: "1:30520578201:web:5b021b0b14d0a558fde808"
};

// 💡 이미 켜져있는 파이어베이스 앱이 있으면 그거 쓰고, 없으면 새로 켜라!
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const storage = getStorage(app);