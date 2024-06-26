import React, { useState } from "react";
import FormComponent from "./CreateKBCluster.jsx";
import GrafanaLogs from "./GrafanaLogs.jsx";
import "./styles.css";
import ClusterDetails from "./Clusterdetails.jsx";
import Sandbox from "./Sanbox.jsx";
import KibanaLogsContainer from "./KibanaLogsContainer/kibanaLogsContainer.jsx";
import CheckConfigurations from "./checkConfigurations.jsx";
import HarAnalyze from "./Har_analyse.jsx";
import { SecureRoute, Security, LoginCallback } from "@okta/okta-react";
import { OktaAuth } from "@okta/okta-auth-js";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home.jsx";
import LoginDashboard from "./Login.jsx";

export default function App() {
  const [results, setResults] = useState([]);
  const [scrollableData, setScrollableData] = useState([]);
  const [activeTab, setActiveTab] = useState("checkCluster");
  const restoreOriginalUri = async () => {
    window.location.href = "/home";
  };
  const oktaAuthConfig = new OktaAuth({
    issuer: import.meta.env.VITE_OKTA_ISSUER,
    clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
    redirectUri: `${window.location.origin}/login/callback`,
    scopes: ["openid", "profile", "email", "groups"],
  });


  return (
    <Security oktaAuth={oktaAuthConfig} restoreOriginalUri={restoreOriginalUri}>
      <Router>
          <SecureRoute path="/home" component={Home}/>
          <Route path="/" component={LoginDashboard}/>
          <Route path="/login/callback" component={LoginCallback} />
      </Router>
    </Security>
  );
}
