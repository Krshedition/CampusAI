import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8bvDpEdZbMSySs1QE0XNpFVIMsG2-LmM",
  authDomain: "campusai-acacf.firebaseapp.com",
  projectId: "campusai-acacf",
  storageBucket: "campusai-acacf.firebasestorage.app",
  messagingSenderId: "155483116794",
  appId: "1:155483116794:web:e4e39ea281ed30a598a543"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
window.db = db;
