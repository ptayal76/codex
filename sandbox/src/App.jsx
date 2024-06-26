import React from "react";
import "./styles.css";
import { SecureRoute, Security, LoginCallback } from "@okta/okta-react";
import { OktaAuth } from "@okta/okta-auth-js";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home.jsx";
import LoginDashboard from "./Login.jsx";
import { ClusterProvider } from "./ClusterContext.jsx";
export default function App() {
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
      <ClusterProvider>
        <Router>
            <SecureRoute path="/home" component={Home}/>
            <Route path="/" component={LoginDashboard}/>
            <Route path="/login/callback" component={LoginCallback} />
        </Router>
      </ClusterProvider>
      
    </Security>
  );
}
