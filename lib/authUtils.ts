// lib/authUtils.ts
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

// User data type
export type User = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string; // Tambahkan photoURL ke tipe User
  credits?: number; // Add credits to User type
};

// Save user to local storage
const saveUserToStorage = (user: User | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

// Get user from local storage
export const getUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null;
  const storedUser  = localStorage.getItem("user");
  return storedUser  ? JSON.parse(storedUser ) : null;
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get user data from Firestore
  let userData: User = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "", // Pastikan ini ada
  };

  try {
    // Try to get user data including credits from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const firestoreData = userDoc.data();
      userData.credits = firestoreData.credits || 1000;
    }
  } catch (error) {
    console.error("Error getting user data from Firestore:", error);
  }

  saveUserToStorage(userData);
  return userData;
};

// Dummy Google sign-in
// Sign in with Google using Firebase Auth
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  let userData: User = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "", // Pastikan ini ada
  };

  // Check if user exists in Firestore, if not create it
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const firestoreData = userSnap.data();
    userData.credits = firestoreData.credits || 1000;
  } else {
    // If user doesn't exist in Firestore, create with default credits
    userData.credits = 1000;
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL, // Pastikan ini ada
      credits: userData.credits,
    });
  }

  saveUserToStorage(userData);
  return userData;
};

// Sign out
export const signOut = () => {
  saveUserToStorage(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
};

// Custom hook to get current user
export const useCurrentUser  = () => {
  const [user, setUser ] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
 const storedUser  = getUserFromStorage();
      setUser (storedUser );

      const handleStorageChange = () => {
        setUser (getUserFromStorage());
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  return user;
};