import React from "react";
import ReactDOM from "react-dom/client";
import { GlobalStateProvider } from "./GlobalState.jsx"
import { ClusterProvider } from './ClusterContext.jsx';
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GlobalStateProvider>
    <ClusterProvider>
    <App />
    </ClusterProvider>
  </GlobalStateProvider>
  
);