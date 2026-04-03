import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("disc_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Notice: We don't expose 'token' anymore because that is handled implicitly via cross-domain session cookies.
  const [token, setToken] = useState(null);

  useEffect(() => {
    // ─── Verify Session Automatically on Load ─────────────────────────
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include" // Attach cross-domain session cookies securely
        });
        if (res.ok) {
           const data = await res.json();
           if (data.authenticated && data.user) {
             console.log("Session verified successfully for:", data.user.email);
             const userData = {
                 uid: data.user.id,
                 id: data.user.id,
                 name: data.user.name,
                 email: data.user.email
             };
             setUser(userData);
             localStorage.setItem("disc_user", JSON.stringify(userData));
           } else {
             // Server responded OK but no valid session — clear everything
             setUser(null);
             localStorage.removeItem("disc_user");
           }
        } else {
           console.warn(`Session verification returned ${res.status}: ${res.statusText}`);
           // Clear stale local state for ANY non-OK response
           setUser(null);
           localStorage.removeItem("disc_user");
        }
      } catch(err) {
         console.error("Session verification fetch failed:", err);
         // Network error — keep existing localStorage state so UI isn't blank
      }
    };
    verifySession();
  }, []);

  useEffect(() => {
    // Handle Google Redirect Hash (OAuth Implicit Flow Returns)
    const handleGoogleRedirect = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          try {
            // Clean the URL hash without reloading the page
            window.history.replaceState(null, null, window.location.pathname);

            const userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            const response = await fetch(userInfoEndpoint, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
              const userInfo = await response.json();
              await signInWithGoogle(accessToken, userInfo);
            }
          } catch (err) {
            console.error("Auth redirect error:", err);
          }
        }
      }
    };

    handleGoogleRedirect();
  }, []);

  const signInWithGoogle = async (accessToken, userInfo) => {
    try {
      // In case we don't have userInfo already
      let info = userInfo;
      if (!info && accessToken) {
        const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        info = await r.json();
      }

      // Generate the Session Cookie internally
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // VERY IMPORTANT: instructs the browser to parse Set-Cookie dynamically
        body: JSON.stringify({
          email: info.email,
          name: info.name,
          googleId: info.sub,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('❌ Events backend auth rejected:', res.status, err);
        throw new Error(err.message || `Server error ${res.status}`);
      }

      const data = await res.json();
      // Backend returns { user: { id, name, email } } + Set-Cookie Header
      const userData = {
        uid: data.user.id,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        picture: info?.picture || "",
      };
      
      localStorage.setItem("disc_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Call backend to clear the HttpOnly session cookie
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("disc_user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
