import React, { useState } from 'react';
import './NavigationDrawer.css'; // Import the CSS file

const NavigationDrawer = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('other');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="nav-drawer">
      <div className="tabs flex flex-col p-2 gap-2">
        <div
          className={`tab ${activeTab === 'createCluster' && 'active'}`}
          onClick={() => handleTabClick('createCluster')}
        >
          Create Cluster
        </div>
        <div
          className={`tab ${activeTab === 'Grafana Logs' && 'active'}`}
          onClick={() => handleTabClick('GrafanaLogs')}
        >
          Grafana Logs
        </div>
        <div
          className={`tab ${activeTab === 'Cluster Info' && 'active'}`}
          onClick={() => handleTabClick('Cluster Info')}
        >
          Cluster Info
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
