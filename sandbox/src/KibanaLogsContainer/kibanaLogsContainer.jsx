import { useState } from "react";
import MyTable from './Table/table.jsx';
import './kibanaLogsContainer.css';
import '../GrafanaLogs.css';
import { Spin } from "antd";
import { useCluster } from "../ClusterContext.jsx";
function KibanaLogsContainer() {
    const {
        kibanaArray,setKibanaArray,
        loadingKibana, setLoadingKibana,
        tableRowData, setTableRowData,
    }= useCluster();
    
    const [formInputs, setFormInputs] = useState({
        StartTimestamp: '2024-03-01T00:00:00',
        EndTimestamp: '2024-06-01T00:00:00',
        Cluster_Id: '672764c0-dc60-11ee-a6bf-13c83',
        //StateToken: 'stateToken',
        //RefreshToken: 'refreshToken',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingKibana(true);
        console.log("Form submitted!  ->", formInputs);
        try {
            const response = await fetch('http://localhost:4000/trigger-kibana', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formInputs),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            } else {
                const res = await response.json();
                const data = JSON.parse(res.json);
                if (data) {
                    const transformedData = parseText(data);
                    setKibanaArray(transformedData);
                    const transformedRow = takeRowdata(transformedData);
                    setTableRowData(transformedRow);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle errors
        }
        finally {
            setLoadingKibana(false);
        }
    };

    const parseText = (data) => {
        if (!data || !data.rawResponse || !data.rawResponse.hits || !data.rawResponse.hits.hits) {
            console.error('Invalid data format');
            return [];
        }
        const newArray = data.rawResponse.hits.hits;
        console.log("data-inside", data.rawResponse.hits.hits);
        console.log("newArray", newArray);
        return newArray;
    };

    const takeRowdata = (data) => {
        const rowArray = data.map((item, index) => ({
            key: index,
            clusterId: item._source.cluster_id,
            timeStamp: item._source["@timestamp"],
            path: item._source.filename,
            message: item._source.message,
        }));
        console.log("row-array: ", rowArray);
        return rowArray;
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormInputs(prevState => ({ ...prevState, [name]: value }));
    };
    return (
        <div className="container">
            <p className="text-3xl">Kibana Logs</p>
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
                <button type="submit" className="submit-button">Fetch Logs</button>
            </form>
            {loadingKibana ? (
                <div className="loading-container flex allign-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                kibanaArray.length ? <MyTable tableRowData={tableRowData} innerJSON={kibanaArray} />: null
            )}
        </div>
    );
}

export default KibanaLogsContainer;
