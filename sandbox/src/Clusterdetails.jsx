import React, { useState, useEffect, useRef } from 'react';
import './ClusterDetails.css';

const ClusterDetails = () => {
  const [jsonData, setJsonData] = useState(null);
  const [clusterVersion, setClusterVersion] = useState('');
  const [commands, setCommands] = useState([]);
  const [flagsData, setFlagsData] = useState(null);
  const [jsonSearchTerm, setJsonSearchTerm] = useState('');
  const [commandsSearchTerm, setCommandsSearchTerm] = useState('');
  const [flagsSearchTerm, setFlagsSearchTerm] = useState('');

  const flagsRef = useRef(null);

  useEffect(() => {
    fetch('./cluster_scripts/clusterDetails.json')
      .then(response => response.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          setJsonData(json);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

    fetch('./cluster_scripts/clusterVersion.txt')
      .then(response => response.text())
      .then(text => {
        setClusterVersion(text);
      });

      const fetchCommands = async () => {
        try {
            const response = await fetch('http://localhost:4000/commands-array');
            const data = await response.json();
            setCommands(data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchCommands();

    fetch('./cluster_scripts/flagDetails.json')
      .then(response => response.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          setFlagsData(json);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });
  }, []);

  const renderJson = (data, searchTerm = '') => {
    const filterData = (data) => {
      if (typeof data === 'object' && data !== null) {
        return Object.keys(data)
          .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
          .reduce((res, key) => (res[key] = data[key], res), {});
      } else if (Array.isArray(data)) {
        return data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()));
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
    } else if (typeof filteredData === 'object' && filteredData !== null) {
      return (
        <table className="json-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(filteredData).map(key => (
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
    alert('Cluster Version copied to clipboard');
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

  const filteredCommands = commands.filter(command =>
    command.toLowerCase().includes(commandsSearchTerm.toLowerCase())
  );

  const scrollToFlags = () => {
    if (flagsRef.current) {
      flagsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="json-viewer-container">
      <div className="cluster-version">
        <span className="cluster-version-text">
          Cluster Version: <strong>{clusterVersion}</strong>
        </span>
        <button onClick={handleCopy} className="copy-button">Copy</button>
      </div>
      <div className="scroll-button-container">
        <button onClick={scrollToFlags} className="scroll-button">Go to Flags</button>
      </div>
      <div className="tables-container">
        <div className="json-viewer">
          <h1>Cluster Details</h1>
          <input
            type="text"
            placeholder="Search JSON..."
            value={jsonSearchTerm}
            onChange={handleJsonSearchChange}
            className="search-input"
          />
          {jsonData ? renderJson(jsonData, jsonSearchTerm) : <p>Loading...</p>}
        </div>
        <div className="commands-table">
          <h1>Commands</h1>
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
        {flagsData ? renderJson(flagsData, flagsSearchTerm) : <p>Loading...</p>}
      </div>
    </div>
  );
};

export default ClusterDetails;
