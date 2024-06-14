import React, { useState } from 'react';
import CSVDataTable from "./CSVDataTable";
import './GrafanaLogs.css';
import { useGlobalState } from './GlobalState.jsx';
import { Spin } from "antd";
import StartToEndTime from './StartToEndTIme.jsx';

const GrafanaLogs = ({ subTab }) => {
  const [csvData, setCsvData] = useState([]);
  const { cname, setCname } = useGlobalState();
  const [formInputs, setFormInputs] = useState({
    input_start_date: '2023-06-06T08:00:00',
    input_end_date: '2024-06-07T09:00:00',
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormInputs(prevState => ({ ...prevState, [name]: value }));
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try{
      const payload = {
        ...formInputs,
        'tenantName': cname
      }
      const response = await fetch('http://localhost:4000/run-grafana-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        parseCSV(data.csvContent);
    
      } else {
        console.log(response)
        console.error('Error running the script');
      }
    }
    catch (error) {
      console.error('Error:', error);
      // Handle errors
    }
    finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");

      if (currentLine.length === headers.length) {
        const row = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j].trim()] = currentLine[j].trim();
        }
        parsedData.push(row);
      }
    }

    setCsvData(parsedData);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredData = csvData.filter(row => {
    return (
      Object.values(row).some(value =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      ) && (filterStatus === "" || row["status"] === filterStatus)
    );
  });

  return (
    <div className="container">
      <p className="text-3xl">Grafana Metrics</p>
        <h1>{subTab}</h1>
      <form onSubmit={handleSubmit} className="input-form">
        {Object.keys(formInputs).map((key) => (
          <div key={key} className="input-group">
            <label className="input-label">
              {key}:
              <input
                type="text"
                name={key}
                value={formInputs[key]}
                onChange={handleInputChange}
                className="input-field"
              />
            </label>
          </div>
        ))}
        <button type="submit" className="submit-button">Fetch Grafana Metrics</button>
      </form>
      <StartToEndTime/>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-field"
        />
        {/* <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select> */}
      </div>
      {loading ? (
          <div className="loading-container flex allign-center justify-center">
            <Spin size="large" />
          </div>
      ) : (
          <CSVDataTable data={filteredData} />
      )
      }
    </div>
  );
};

export default GrafanaLogs;
