import React, { useState } from 'react';
import './NavigationDrawer.css';

const NavigationDrawer = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('other');
  const [isGrafanaLogsOpen, setIsGrafanaLogsOpen] = useState(false);

  const handleTabClick = (tab) => {
    if (tab === 'GrafanaLogs') {
      setIsGrafanaLogsOpen(!isGrafanaLogsOpen);
    } else {
      setActiveTab(tab);
      onTabChange(tab);
      // setIsGrafanaLogsOpen(false); // Close dropdown if another tab is clicked
    }
  };

  // const handleSubTabClick = (subTab) => {
  //   onSubTabChange(subTab);
  //   setActiveTab('GrafanaLogs');
  //   setIsGrafanaLogsOpen(false); // Close dropdown after selecting a sub-tab
  // };

  return (
    <div className="nav-drawer">
      <div className="tabs flex flex-col p-2 gap-2">
        <div
          className={`tab ${activeTab === 'checkCluster' && 'active'}`}
          onClick={() => handleTabClick('checkCluster')}
        >
          Check Cluster
        </div>
        <div
          className={`tab ${activeTab === 'createCluster' && 'active'}`}
          onClick={() => handleTabClick('createCluster')}
        >
          Create Cluster
        </div>
        <div
          className={`tab ${activeTab === 'GrafanaLogs' && 'active'}`}
          onClick={() => handleTabClick('GrafanaLogs')}
        >
          Grafana Logs
        </div>
        {isGrafanaLogsOpen && (
          <div className="sub-tabs flex flex-col p-2 gap-2">
            <div className="tab" onClick={() => handleTabClick('GrafanaLogs1')}>V2 Public Apis</div>
            <div className="tab" onClick={() => handleTabClick('GrafanaLogs2')}>V1 Public Apis</div>
            <div className="tab" onClick={() => handleTabClick('GrafanaLogs3')}>Internal Apis</div>
          </div>
        )}
        <div
          className={`tab ${activeTab === 'KibanaLogs' && 'active'}`}
          onClick={() => handleTabClick('KibanaLogs')}
        >
          Kibana Logs
        </div>
        <div
          className={`tab ${activeTab === 'Sandbox' && 'active'}`}
          onClick={() => handleTabClick('Sandbox')}
        >
          Sandbox
        </div>
        <div
          className={`tab ${activeTab === 'other' && 'active'}`}
          onClick={() => handleTabClick('other')}
        >
          Other
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;
