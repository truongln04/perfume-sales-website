import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "54799742951-6l8glv392okitc7o3ccch6lm6us2pkcs.apps.googleusercontent.com";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Bọc toàn bộ app trong GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);