import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";
import { ThemeProvider } from "@material-tailwind/react";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
