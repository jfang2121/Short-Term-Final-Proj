import React from "react";
import ReactDOM from "react-dom";
import Map from "./Map";
import "./App.css"; // Import the CSS file

function App() {
  return (
    <div className="app-container">
      <Map onSelectPlace={(place) => console.log(place)} />
    </div>
  );
}

export default App;
