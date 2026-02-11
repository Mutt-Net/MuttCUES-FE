import React from "react";
import { FileUpload } from "./components/FileUpload";

export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MuttCUES File Service</h1>
      <FileUpload />
    </div>
  );
}
