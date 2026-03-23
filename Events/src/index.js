import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import MovieProvider from "./context/Movie.context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/DiscussionAuth.context";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "missing-client-id";

console.log("Park Events: App Mounting...");
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Park Events: Root element not found!");
} else {
  // Simple Error Boundary to avoid white screen on crash
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <BrowserRouter>
        <MovieProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </GoogleOAuthProvider>
        </MovieProvider>
      </BrowserRouter>
    );
    console.log("Park Events: App Rendered Successfully");
  } catch (error) {
    console.error("Park Events: Mount Fatal Error", error);
    rootElement.innerHTML = `
      <div style="background:#040b17; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px;">
        <h1 style="color:#a900e5">Park Events Error</h1>
        <p>The application crashed during startup. Please contact support.</p>
        <pre style="background:#1a1c2c; padding:15px; border-radius:10px; color:#ff4444; max-width:80%; overflow:auto;">${error.message}</pre>
      </div>
    `;
  }
}
