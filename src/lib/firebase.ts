
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtCAgJjHgROM7iy5oeFGlXFkLFAwxjb3M",
  authDomain: "warzone-in.firebaseapp.com",
  databaseURL: "https://warzone-in-default-rtdb.firebaseio.com",
  projectId: "warzone-in",
  storageBucket: "warzone-in.appspot.com",
  messagingSenderId: "572218286908",
  appId: "1:572218286908:android:d41c625a6a8160c71d3439"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithRedirect, getRedirectResult };
