import React, { createContext, useContext, useState } from 'react';

const ClusterContext = createContext();

export const useCluster = () => useContext(ClusterContext);

export const ClusterProvider = ({ children }) => {
  const [jsonData, setJsonData] = useState(null);
  const [clusterVersion, setClusterVersion] = useState('');
  const [commands, setCommands] = useState([]);
  const [appliedPatches, setAppliedPatches] = useState([]);
  const [flagsData, setFlagsData] = useState(null);
  const [versionInfo, setVersionInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scriptRunning, setScriptRunning] = useState(false);

  return (
    <ClusterContext.Provider value={{
      jsonData, setJsonData,
      clusterVersion, setClusterVersion,
      commands, setCommands,
      appliedPatches, setAppliedPatches,
      flagsData, setFlagsData,
      versionInfo, setVersionInfo,
      isLoading, setIsLoading,
      scriptRunning, setScriptRunning
    }}>
      {children}
    </ClusterContext.Provider>
  );
};
