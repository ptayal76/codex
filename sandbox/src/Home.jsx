import React, { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import FormComponent from "./CreateKBCluster.jsx";
import NavigationDrawer from "./NavigationDrawer.jsx";
import GrafanaLogs from "./GrafanaLogs.jsx";
import "./styles.css";
import ClusterDetails from "./Clusterdetails.jsx";
import Sandbox from "./Sanbox.jsx";
import KibanaLogsContainer from "./KibanaLogsContainer/kibanaLogsContainer.jsx";
import CheckConfigurations from "./checkConfigurations.jsx";
import Heading from "./Heading";
import { ClusterProvider } from "./ClusterContext";
import HarAnalyze from "./Har_analyse.jsx";
import { OktaAuth } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("checkCluster");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // setActiveSubTab('');
  };
  const restoreOriginalUri = async () => {
    window.location.href = "/home";
  };
  const oktaAuthConfig = new OktaAuth({
    issuer: import.meta.env.VITE_OKTA_ISSUER,
    clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
    redirectUri: `${window.location.origin}/login/callback`,
    scopes: ["openid", "profile", "email", "groups"],
  });
  const renderContent = () => {
    switch (activeTab) {
      case "GrafanaLogs":
        return <GrafanaLogs />;
      case "checkCluster":
        return <ClusterDetails />;
      case "createCluster":
        return <FormComponent />;
      case "Sandbox":
        return <Sandbox />;
      case "KibanaLogs":
        return <KibanaLogsContainer />;
      case "checkConfig":
        return <CheckConfigurations />;
      case "harAnalyze":
        return <HarAnalyze />;
      default:
        return <></>;
    }
  };
  return (
    <Security oktaAuth={oktaAuthConfig} restoreOriginalUri={restoreOriginalUri}>
      <ClusterProvider>
        <div className="app-container">
          <Heading />
          <NavigationDrawer onTabChange={handleTabChange} />
          <div className="main-content">
            <SearchBar />
            {/* <SearchResults results={results} /> */}
            <div className="py-10">{renderContent()}</div>
          </div>
        </div>
      </ClusterProvider>
    </Security>
  );
};

export default Home;
