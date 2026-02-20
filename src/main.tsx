import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackOfficeApp } from "./BackOfficeApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BackOfficeApp />
  </StrictMode>,
);
