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
  const [versionInfo, setVersionInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scriptRunning, setScriptRunning] = useState(false);

  //for kibana
  const [loadingKibana, setLoadingKibana]= useState(false);
  const [kibanaArray, setKibanaArray]= useState([]);
  const [tableRowData, setTableRowData] = useState([]);

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
      versionInfo, setVersionInfo,
      isLoading, setIsLoading,
      scriptRunning, setScriptRunning,
      
      loadingKibana, setLoadingKibana,
      kibanaArray,setKibanaArray,
      tableRowData, setTableRowData,

      loadingCSP, setLoadingCSP,
      jsonCSPFile, setjsonCSPFile,

    }}>
      {children}
    </ClusterContext.Provider>
  );
};
