import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import MovieProvider from "./context/Movie.context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/DiscussionAuth.context";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "missing-client-id";

const rootElement = document.getElementById("root");
if (rootElement) {
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
}
