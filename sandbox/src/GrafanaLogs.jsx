import React, { useContext, useState } from 'react';
import CSVDataTable from "./CSVDataTable";
import './GrafanaLogs.css';
import { useGlobalState } from './GlobalState.jsx';
import { Spin } from "antd";
import { useCluster } from "./ClusterContext.jsx";
import { DatePicker} from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';

const rangePresets = [
    {
        label: 'Last Week',
        value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
        label: 'Last 2 Weeks',
        value: [dayjs().add(-14, 'd'), dayjs()],
    },
    {
        label: 'Last 30 days',
        value: [dayjs().add(-30, 'd'), dayjs()],
    },
    {
        label: 'Last 90 days',
        value: [dayjs().add(-90, 'd'), dayjs()],
    },
];
const GrafanaLogs = ({ subTab }) => {
  const { 
    cname, setCname,apiUrl
  } = useGlobalState();
  const {
    loadingGrafana, setLoadingGrafana,
    grafanaFormInputs,setGrafanaFormInputs,
    grafanaCSVData, setGrafanaCSVData,
  } = useCluster();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormInputs(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingGrafana(true);
    try{
      const payload = {
        ...grafanaFormInputs,
        'tenantName': cname
      }
      const response = await fetch(`${apiUrl}/run-grafana-script`, {
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
      setLoadingGrafana(false);
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
    setGrafanaCSVData(parsedData);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const filteredData = grafanaCSVData.filter(row => {
    return (
      Object.values(row).some(value =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      ) && (filterStatus === "" || row["status"] === filterStatus)
    );
  });
  console.log("gInputs: ",grafanaFormInputs);
  const [startDateDefault, startTimeDefault]= grafanaFormInputs.input_start_date.split("T");
  const [endDateDefault , endTimeDefault]= grafanaFormInputs.input_end_date.split("T");
  const defaultRange = [dayjs(startDateDefault+'      '+startTimeDefault), dayjs(endDateDefault+'      '+endTimeDefault)];
  return (
    <div className="container">
      <p className="text-3xl py-6">Grafana Metrics</p>
        <h1>{subTab}</h1>
      <form onSubmit={handleSubmit} className="input-form gap-4">
        <div className='flex flex-row allign-center flex-grow'>
            <span className="px-3 py-2 bg-gray-50 border border-gray-300 border-r-0 rounded-l-md font-semibold">Select Date and Time:</span>
            <RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD      HH:mm:ss"
                onChange={(value, dateString) => {
                    console.log('Selected Time: ', value);
                    console.log('Formatted Selected Time: ', dateString);
                    const [startDate,startTime]= dateString[0].split("      ");
                    const [endDate, endTime]= dateString[1].split("      ");
                    const StartTimeStamp= startDate+'T'+startTime;
                    const EndTimeStamp= endDate+ 'T'+endTime;
                    setGrafanaFormInputs(prevState => ({
                        ...prevState,
                        input_start_date: StartTimeStamp,
                        input_end_date: EndTimeStamp,
                    }));
                }}
                defaultValue={defaultRange}
                presets={[
                    {
                        label: <span aria-label="Current Time to End of Day">Till Now today</span>,
                        value: () => [dayjs().startOf('day'), dayjs()],
                    },
                    ...rangePresets,
                ]}
                className="border border-gray-300 rounded-r-md"
                style={{width: '50%'}}
            />
        </div>
        <button type="submit" className="submit-button">Fetch Grafana Metrics</button>
      </form>
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
      {loadingGrafana ? (
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
