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
        <img src="/static/icons/TS-logo-white-no-bg.svg" alt="TS" className={"ts-icon"}/>
        <div className="tabs flex flex-col p-2 gap-2">
          <div
              className={`tab ${activeTab === 'checkCluster' && 'active'}`}
              onClick={() => handleTabClick('checkCluster')}
          >
            <img src="/static/icons/settings-svgrepo-com.svg" alt="Check Cluster" className="tab-icon"/>
            Check Cluster
          </div>
          <div
              className={`tab ${activeTab === 'createCluster' && 'active'}`}
              onClick={() => handleTabClick('createCluster')}
          >
            <img src="/static/icons/ic_cluster.svg" alt="Create Cluster" className="tab-icon"/>
            Create Cluster
          </div>
          <div
              className={`tab ${activeTab === 'GrafanaLogs' && 'active'}`}
              onClick={() => handleTabClick('GrafanaLogs')}
          >
            <img src="/static/icons/grafana-icon.svg" alt="Grafana Logs" className="tab-icon"/>
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
            <img src="/static/icons/kibana-svgrepo-com.svg" alt="Kibana" className="tab-icon"/>
            Kibana Logs
          </div>
          <div
              className={`tab ${activeTab === 'Sandbox' && 'active'}`}
              onClick={() => handleTabClick('Sandbox')}
          >
            <img src="/static/icons/sandbox-svgrepo-com.svg" alt="Sandbox" className="tab-icon"/>
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
