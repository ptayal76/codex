import React, { useState, useEffect, useRef } from "react";
import "./ClusterDetails.css";
import { useGlobalState } from "./GlobalState.jsx";
import { useCluster } from "./ClusterContext";
import { Spin } from "antd";

const ClusterDetails = () => {
  const {
    jsonData,
    setJsonData,
    currentVersion,
    setCurrentVersion,
    upgradeVersion,
    setUpgradeVersion,
    clusterVersion,
    setClusterVersion,
    commands,
    setCommands,
    appliedPatches,
    setAppliedPatches,
    flagsData,
    setFlagsData,
    isLoading,
    setIsLoading,
    scriptRunning,
    setScriptRunning,
  } = useCluster();
  const {apiUrl}= useGlobalState();
  const [jsonSearchTerm, setJsonSearchTerm] = useState("");
  const [commandsSearchTerm, setCommandsSearchTerm] = useState("");
  const [flagsSearchTerm, setFlagsSearchTerm] = useState("");
  const [appliedPatchesSearchTerm, setAppliedPatchesSearchTerm] = useState("");
  const flagsRef = useRef(null);
  const { cname, setCname } = useGlobalState();
  const { cenv, setCenv } = useGlobalState();

  const renderJson = (data, searchTerm = "") => {
    const filterData = (data) => {
      if (typeof data === "object" && data !== null) {
        return Object.keys(data)
          .filter((key) => key.toLowerCase().includes(searchTerm.toLowerCase()))
          .reduce((res, key) => ((res[key] = data[key]), res), {});
      } else if (Array.isArray(data)) {
        return data.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return data;
    };

    const filteredData = filterData(data);

    if (Array.isArray(filteredData)) {
      return (
        <table className="json-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>{renderJson(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (typeof filteredData === "object" && filteredData !== null) {
      return (
        <table className="json-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(filteredData).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{renderJson(filteredData[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return <span>{String(filteredData)}</span>;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(clusterVersion);
  };

  const handleJsonSearchChange = (event) => {
    setJsonSearchTerm(event.target.value);
  };

  const handleCommandsSearchChange = (event) => {
    setCommandsSearchTerm(event.target.value);
  };

  const handleFlagsSearchChange = (event) => {
    setFlagsSearchTerm(event.target.value);
  };

  const handleAppliedPatchesSearchChange = (event) => {
    setAppliedPatchesSearchTerm(event.target.value);
  };

  const filteredCommands = commands.filter((command) =>
    command.toLowerCase().includes(commandsSearchTerm.toLowerCase())
  );

  const filteredAppliedPatches = appliedPatches.filter((patch) =>
    patch.toLowerCase().includes(appliedPatchesSearchTerm.toLowerCase())
  );

  const scrollToFlags = () => {
    if (flagsRef.current) {
      flagsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getClusterInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setScriptRunning(true);
    try {
      const clusterdata = {
        cluster_name: cname,
        env: cenv,
      };
      console.log(clusterdata)
      const response = await fetch(`${apiUrl}/get-cluster-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clusterdata),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        // Assuming data structure from the server matches your previous file-based structure
        setClusterVersion(data.clusterId);
        setJsonData(data.clusterDetails);
        setCommands(data.commands);
        setCurrentVersion(data.currentVersion);
        setUpgradeVersion(data.upgradeVersion);
        // setVersionInfo(`Current Version: ${data.currentVersion}\nUpgrade Version: ${data.upgradeVersion}`);
        setAppliedPatches(data.patches);
        setFlagsData(data.flagsData); // Assuming this is part of your data structure

        setIsLoading(false);
      } else {
        console.error("Error running the script");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching cluster information:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="json-viewer-container">
      <div className="scroll-button-container">
        <button onClick={getClusterInfo} className="scroll-button">
          Get Cluster Information
        </button>
      </div>
      {isLoading ? (
        scriptRunning ? (
          <div className="loading-container flex allign-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          ""
        )
      ) : (
        <div>
          <div className="info-container">
            <div className="cluster-version">
              <span className="cluster-version-text">
                Cluster Id: <strong>{clusterVersion}</strong>
              </span>
              <button onClick={handleCopy} className="copy-button">
                Copy
              </button>
            </div>
            <div className="version-info">
              <pre>Current Version {currentVersion}</pre>
              <pre>Upgrade Version {upgradeVersion}</pre>
            </div>
          </div>
          <div className="scroll-button-container">
            <button onClick={scrollToFlags} className="scroll-button">
              Go to Flags
            </button>
          </div>
          <div className="tables-wrapper">
            <div className="tables-container left">
              <div className="applied-patches-table">
                <h1>Applied Patches</h1>
                <input
                  type="text"
                  placeholder="Search Applied Patches..."
                  value={appliedPatchesSearchTerm}
                  onChange={handleAppliedPatchesSearchChange}
                  className="search-input"
                />
                <table className="json-table">
                  <thead>
                    <tr>
                      <th>Patches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppliedPatches.map((patch, index) => (
                      <tr key={index}>
                        <td>{patch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="json-viewer">
                <h1>Cluster Details</h1>
                <input
                  type="text"
                  placeholder="Search JSON..."
                  value={jsonSearchTerm}
                  onChange={handleJsonSearchChange}
                  className="search-input"
                />
                {jsonData ? (
                  renderJson(jsonData, jsonSearchTerm)
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
            <div className="tables-container right">
              <div className="commands-table">
                <h1>Applied Commands</h1>
                <input
                  type="text"
                  placeholder="Search Commands..."
                  value={commandsSearchTerm}
                  onChange={handleCommandsSearchChange}
                  className="search-input"
                />
                <table className="json-table">
                  <thead>
                    <tr>
                      <th>Commands</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommands.map((command, index) => (
                      <tr key={index}>
                        <td>{command}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div ref={flagsRef} className="flags-table">
                <h1>Flags</h1>
                <input
                  type="text"
                  placeholder="Search Flags..."
                  value={flagsSearchTerm}
                  onChange={handleFlagsSearchChange}
                  className="search-input"
                />
                {flagsData ? (
                  renderJson(flagsData, flagsSearchTerm)
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterDetails;
