import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import MyHeader from "./Header.jsx";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <MyHeader />
    <App />
  </StrictMode>
);