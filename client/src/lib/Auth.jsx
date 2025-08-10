// src/lib/Auth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase"; // Ensure firebase.js exports `auth`

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Authentication actions
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const googleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
  const signOutUser = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        googleSignIn,
        signOut: signOutUser // ✅ consistent naming for Navbar
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
