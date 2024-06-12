import React, { useState, useEffect } from "react";
import TabsComponent from "./TabsComponent.jsx";
import ScrollableComponent from "./ScrollableComponent.jsx";
import StyledComponent from "./StyledComponent.jsx";
import ResponsiveComponent from "./ResponsiveComponent.jsx";
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

  useEffect(() => {
    const callApi = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/scrollable");
        const data = await response.json();
        setScrollableData(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
    callApi();
  }, []);

  const handleSearch = (query) => {
    const dummyResults = [
      {
        title: `Result for ${query} 1`,
        link: "#",
        description: "This is a description for result 1.",
      },
      {
        title: `Result for ${query} 2`,
        link: "#",
        description: "This is a description for result 2.",
      },
      {
        title: `Result for ${query} 3`,
        link: "#",
        description: "This is a description for result 3.",
      },
    ];
    setResults(dummyResults);
  };

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
      case 'other':
      default:
        return (
          <>
            <TabsComponent />
            <ScrollableComponent response={scrollableData} />
            <StyledComponent />
            <ResponsiveComponent />
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
        <SearchBar onSearch={handleSearch} />
        {/* <SearchResults results={results} /> */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
    </ClusterProvider>
  );
}
