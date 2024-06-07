import { useState } from "react";
import MyTable from './Table/table.jsx';
import './kibanaLogsContainer.css';
import '../GrafanaLogs.css';
import { message } from "antd";

function KibanaLogsContainer() {
    const [tableData, setTableData] = useState([]);
    const [tableRowData, setTableRowData] = useState([]);
    const [formInputs, setFormInputs] = useState({
        StartTimestamp: '2024-03-01T00:00:00',
        EndTimestamp: '2024-06-01T00:00:00',
        Cluster_Id: '3d23a190-ccdc-11ed-8a31-4d8aa',
        Cluster_Name: 'metadata',
        //StateToken: 'stateToken',
        //RefreshToken: 'refreshToken',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted!");
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
                    setTableData(transformedData);
                    const transformedRow = takeRowdata(transformedData);
                    setTableRowData(transformedRow);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle errors
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
            {tableData.length ? <MyTable tableRowData={tableRowData} innerJSON={tableData} /> : ""}
        </div>
    );
}

export default KibanaLogsContainer;
