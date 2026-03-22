import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import MovieProvider from "./context/Movie.context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/DiscussionAuth.context";

console.log("React entry point starting...");

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "missing-client-id";

// Simple Error Boundary component
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Root Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", background: "white" }}>
          <h1>Something went wrong at the root level.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
console.log("Root element found:", !!rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <MovieProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </GoogleOAuthProvider>
        </MovieProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);
