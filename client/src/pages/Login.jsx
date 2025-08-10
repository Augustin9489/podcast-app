import React, { useState } from "react";
import { useAuth } from "../lib/Auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signIn, signUp, googleSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const trySignIn = async () => {
    setErr("");
    try {
      await signIn(email, pass);
      nav("/");
    } catch (e) {
      setErr(e.message || "Sign in failed");
    }
  };

  const trySignUp = async () => {
    setErr("");
    try {
      await signUp(email, pass);
      nav("/");
    } catch (e) {
      setErr(e.message || "Sign up failed");
    }
  };

  const tryGoogle = async () => {
    setErr("");
    try {
      await googleSignIn();
      nav("/");
    } catch (e) {
      setErr(e.message || "Google sign-in failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login / Sign up</h2>
      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={trySignIn}
            className="flex-1 p-2 bg-blue-600 text-white rounded"
          >
            Sign in
          </button>
          <button
            onClick={trySignUp}
            className="flex-1 p-2 bg-green-600 text-white rounded"
          >
            Sign up
          </button>
        </div>
        <button
          onClick={tryGoogle}
          className="w-full p-2 border rounded hover:bg-gray-100"
        >
          Sign in with Google
        </button>
        {err && <div className="text-red-600 mt-2">{err}</div>}
      </div>
      <div className="text-xs text-gray-500 mt-3">
        Firebase must be configured for auth to work. See README to set
        VITE_FIREBASE_* env vars.
      </div>
    </div>
  );
}
