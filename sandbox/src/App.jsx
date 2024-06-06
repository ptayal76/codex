import React, { useState, useEffect } from "react";
import TabsComponent from "./TabsComponent.jsx";
import ScrollableComponent from "./ScrollableComponent.jsx";
import StyledComponent from "./StyledComponent.jsx";
import ResponsiveComponent from "./ResponsiveComponent.jsx";
import SearchBar from "./SearchBar.jsx";
import SearchResults from "./SearchResults.jsx";
import FormComponent from './CreateKBCluster.jsx';
import NavigationDrawer from './NavigationDrawer.jsx';
import GrafanaLogs from './GrafanaLogs.jsx';
import "./styles.css";
import ClusterDetails from './Clusterdetails.jsx';
import Sandbox from "./Sanbox.jsx";
import KibanaLogsContainer from './KibanaLogsContainer/kibanaLogsContainer.jsx';


export default function App() {
  const [results, setResults] = useState([]);
  const [scrollableData, setScrollableData] = useState([]);
  const [activeTab, setActiveTab] = useState('other');

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
    if (activeTab === 'GrafanaLogs1' || activeTab === 'GrafanaLogs2' || activeTab === 'GrafanaLogs3') {
      return <GrafanaLogs subTab={activeTab} />;
    }
    switch (activeTab) {
      case 'checkCluster':
        return <ClusterDetails />;
      case 'createCluster':
        return <FormComponent />;
      case 'Sandbox':
        return <Sandbox />;
      case 'KibanaLogs':
          return <KibanaLogsContainer/>;
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
    <div className="app-container">
      <NavigationDrawer onTabChange={handleTabChange} />
      <div className="main-content">
        {/* <SearchBar onSearch={handleSearch} />
        <SearchResults results={results} /> */}
        <div className="grid-container">
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
