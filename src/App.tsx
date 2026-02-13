import React from "react";
import { FileUpload } from "./components/FileUpload";
import { ImageProcessor } from "./components/ImageProcessor";
import DdsConverter from "../DdsConverter";

export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>MuttCUES</h1>
      <p>AI-Powered Image Upscaling & Format Conversion</p>
      
      <hr style={{ margin: "2rem 0" }} />
      
      <ImageProcessor />
      
      <hr style={{ margin: "2rem 0" }} />
      
      <DdsConverter />
      
      <hr style={{ margin: "2rem 0" }} />
      
      <h2>Simple File Upload</h2>
      <FileUpload />
    </div>
  );
}
