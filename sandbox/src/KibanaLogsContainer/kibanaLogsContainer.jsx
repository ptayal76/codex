import { useState } from "react";
import MyTable from './Table/table.jsx';
import './kibanaLogsContainer.css';
import '../GrafanaLogs.css';
import KibanaTabs from "./FetchToKibana/tabs.jsx";
import { Spin, Tabs } from "antd";
import { useCluster } from "../ClusterContext.jsx";
import { DatePicker , Input, Collapse} from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import { useGlobalState } from "../GlobalState.jsx";

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

function KibanaLogsContainer() {
    const {
        kibanaArray,setKibanaArray,
        loadingKibana, setLoadingKibana,
        tableRowData, setTableRowData,
        kibanaFormInputs, setKibanaFormInputs,
    }= useCluster();
    const {apiUrl}=useGlobalState();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingKibana(true);
        console.log("Form submitted!  ->", kibanaFormInputs);
        try {
            const response = await fetch(`${apiUrl}/trigger-kibana`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(kibanaFormInputs),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            } else {
                const res = await response.json();
                const data = JSON.parse(res);
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
        setKibanaFormInputs(prevState => ({
            ...prevState,
            Cluster_Id: event.target.value,
        }));
    };
    const onOk = (value) => {
        console.log('onOk: ', value);
    };
    const [startDateDefault, startTimeDefault]= kibanaFormInputs.StartTimestamp.split("T");
    const [endDateDefault , endTimeDefault]= kibanaFormInputs.EndTimestamp.split("T");
    const defaultRange = [dayjs(startDateDefault+'      '+startTimeDefault), dayjs(endDateDefault+'      '+endTimeDefault)];
    return (
        <div className="container flex flex-col gap-6">
            <p className="text-3xl">Kibana Logs</p>
            <div onSubmit={handleSubmit} className="input-form gap-6 flex flex-col">
                <Input addonBefore={<strong>Cluster ID :</strong>} onChange={handleInputChange} size="large" defaultValue={kibanaFormInputs.Cluster_Id}/>    
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
                        setKibanaFormInputs(prevState => ({
                            ...prevState,
                            StartTimestamp: StartTimeStamp,
                            EndTimestamp: EndTimeStamp,
                        }));
                    }}
                    onOk={onOk}
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
                <Collapse
                    size="large"
                    items={[
                        {
                        key: '1',
                        label: <strong>Trigger logs to Kibana</strong>,
                        children: <KibanaTabs/>,
                        },
                    ]}
                />
                <button className="submit-button" onClick={handleSubmit}>Fetch Logs</button>
            </div>
           
            {loadingKibana ? (
                <div className="loading-container flex allign-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <MyTable tableRowData={tableRowData} innerJSON={kibanaArray} />
            )}
        </div>
    );
}

export default KibanaLogsContainer;
