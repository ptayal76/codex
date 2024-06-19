import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar.jsx";
import FormComponent from './CreateKBCluster.jsx';
import NavigationDrawer from './NavigationDrawer.jsx';
import GrafanaLogs from './GrafanaLogs.jsx';
import "./styles.css";
import ClusterDetails from './Clusterdetails.jsx';
import Sandbox from "./Sanbox.jsx";
import KibanaLogsContainer from './KibanaLogsContainer/kibanaLogsContainer.jsx';
import CheckConfigurations from "./checkConfigurations.jsx";
import Heading from './Heading';
import { ClusterProvider } from './ClusterContext';

export default function App() {
  const [results, setResults] = useState([]);
  const [scrollableData, setScrollableData] = useState([]);
  const [activeTab, setActiveTab] = useState('checkCluster');


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // setActiveSubTab('');
  };

  // const handleSubTabChange = (subTab) => {
  //   setActiveSubTab(subTab);
  // };

  const renderContent = () => {
    switch (activeTab) {
      case 'GrafanaLogs':
        return <GrafanaLogs />;
      case 'checkCluster':
        return <ClusterDetails />;
      case 'createCluster':
        return <FormComponent />;
      case 'Sandbox':
        return <Sandbox />;
      case 'KibanaLogs':
          return <KibanaLogsContainer/>;
      case 'checkConfig':
        return <CheckConfigurations/>
      default:
        return (
          <>
            
          </>
        );
    }
  };

  return (
    <ClusterProvider>
    <div className="app-container">
      <Heading />
      <NavigationDrawer onTabChange={handleTabChange} />
      <div className="main-content">
        <SearchBar />
        {/* <SearchResults results={results} /> */}
        <div className="py-10">
          {renderContent()}
        </div>
      </div>
    </div>
    </ClusterProvider>
  );
}
