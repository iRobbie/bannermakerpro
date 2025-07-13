import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BannerMaker from "./components/BannerMaker";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BannerMaker />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;