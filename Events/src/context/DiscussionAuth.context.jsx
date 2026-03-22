import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("disc_token"));

  useEffect(() => {
    if (token) {
      try {
        // Decode the JWT payload to get user info (no verification needed client-side)
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ uid: payload.uid, name: payload.name, picture: payload.picture, email: payload.email });
        } else {
          signOut();
        }
      } catch {
        signOut();
      }
    }
  }, [token]);

  const signInWithGoogle = async (googleCredential) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleCredential }),
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from server:", text.substring(0, 100));
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      localStorage.setItem("disc_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem("disc_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
