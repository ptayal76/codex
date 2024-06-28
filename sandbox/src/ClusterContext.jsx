import React, { createContext, useContext } from 'react';
import useLocalStorage from './useLocalStorage';

const ClusterContext = createContext();

export const useCluster = () => useContext(ClusterContext);

export const ClusterProvider = ({ children }) => {
  //for nav-tab
  const [activeTab, setActiveTab] = useLocalStorage("activeTab", "checkCluster");
  
  //for cluster details
  const [jsonData, setJsonData] = useLocalStorage("jsonData", null);
  const [clusterVersion, setClusterVersion] = useLocalStorage("clusterVersion", '');
  const [commands, setCommands] = useLocalStorage("commands", []);
  const [appliedPatches, setAppliedPatches] = useLocalStorage("appliedPatches", []);
  const [flagsData, setFlagsData] = useLocalStorage("flagsData", null);
  const [currentVersion, setCurrentVersion] = useLocalStorage("currentVersion", '');
  const [upgradeVersion, setUpgradeVersion] = useLocalStorage("upgradeVersion", '');
  const [isLoading, setIsLoading] = useLocalStorage("isLoading", true);
  const [scriptRunning, setScriptRunning] = useLocalStorage("scriptRunning", false);

  //for grafana
  const [loadingGrafana, setLoadingGrafana]= useLocalStorage("loadingGrafana", false);
  const [grafanaFormInputs, setGrafanaFormInputs]= useLocalStorage("grafanaFormInputs", {
    input_start_date: '2024-06-06T08:00:00',
    input_end_date: '2024-06-07T09:00:00',
  });
  const [grafanaCSVData, setGrafanaCSVData]= useLocalStorage("grafanaCSVData", []);

  //for kibana
  const [loadingKibana, setLoadingKibana]= useLocalStorage("loadingKibana", false);
  const [kibanaArray, setKibanaArray]= useLocalStorage("kibanaArray", []);
  const [tableRowData, setTableRowData] = useLocalStorage("tableRowData", []);
  const [kibanaFormInputs, setKibanaFormInputs]= useLocalStorage("kibanaFormInputs", {
    StartTimestamp: '2024-04-10T00:00:00',
    EndTimestamp: '2024-06-18T00:00:00',
    Cluster_Name: 'Metadata',
    Env: 'prod',
  });

  //for checkConfigurations
  const [loadingCSP, setLoadingCSP]= useLocalStorage("loadingCSP", false);
  const [jsonCSPFile, setjsonCSPFile]= useLocalStorage("jsonCSPFile", null);

  return (
    <ClusterContext.Provider value={{
      activeTab, setActiveTab,

      jsonData, setJsonData,
      clusterVersion, setClusterVersion,
      commands, setCommands,
      appliedPatches, setAppliedPatches,
      flagsData, setFlagsData,
      currentVersion,setCurrentVersion,
      upgradeVersion,setUpgradeVersion,
      isLoading, setIsLoading,
      scriptRunning, setScriptRunning,
      
      loadingGrafana, setLoadingGrafana,
      grafanaFormInputs,setGrafanaFormInputs,
      grafanaCSVData, setGrafanaCSVData,

      loadingKibana, setLoadingKibana,
      kibanaArray,setKibanaArray,
      tableRowData, setTableRowData,
      kibanaFormInputs, setKibanaFormInputs,

      loadingCSP, setLoadingCSP,
      jsonCSPFile, setjsonCSPFile,
    }}>
      {children}
    </ClusterContext.Provider>
  );
};
