import React, { createContext, useContext, useState } from 'react';

const ClusterContext = createContext();

export const useCluster = () => useContext(ClusterContext);

export const ClusterProvider = ({ children }) => {
  //for cluster details
  const [jsonData, setJsonData] = useState(null);
  const [clusterVersion, setClusterVersion] = useState('');
  const [commands, setCommands] = useState([]);
  const [appliedPatches, setAppliedPatches] = useState([]);
  const [flagsData, setFlagsData] = useState(null);
  const [currentVersion, setCurrentVersion] = useState('');
  const [upgradeVersion, setUpgradeVersion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scriptRunning, setScriptRunning] = useState(false);

  //for grafana
  const [loadingGrafana, setLoadingGrafana]= useState(false);
  const [grafanaFormInputs, setGrafanaFormInputs]= useState({
    input_start_date: '2023-06-06T08:00:00',
    input_end_date: '2024-06-07T09:00:00',
  });
  const [grafanaCSVData, setGrafanaCSVData]= useState([]);

  //for kibana
  const [loadingKibana, setLoadingKibana]= useState(false);
  const [kibanaArray, setKibanaArray]= useState([]);
  const [tableRowData, setTableRowData] = useState([]);
  const [kibanaFormInputs, setKibanaFormInputs]= useState({
    StartTimestamp: '2024-04-10T00:00:00',
    EndTimestamp: '2024-06-18T00:00:00',
    Cluster_Id: '672764c0-dc60-11ee-a6bf-13c83',
  });

  //for checkConfigurations
  const [loadingCSP, setLoadingCSP]= useState(false);
  const [jsonCSPFile, setjsonCSPFile]= useState(null);


  return (
    <ClusterContext.Provider value={{
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
