import React, { useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';


const grafanaToken = import.meta.env.VITE_GRAFANA_TOKEN;

const url = "https://thoughtspot.grafana.net/api/ds/query";

const metricKeys = ['time', 'api', 'cluster', 'collection_level', 'error', 'method', 'org_id', 'rel_version', 'saas_env', 'service_name', 'status', 'tenant_id', 'tenant_name', 'duration'];

const makeQueryDict = (queryRefId, queryExpr) => {
    return {
        refId: queryRefId,
        datasourceId: 4,
        expr: queryExpr,
        interval: "600",
        maxDataPoints: 1000,
        instant: false,
        range: true,
        format: "table"
    };
};

const processApiMetricFrames = async (apiMetricFramesList) => {
    let csvContent = '';
    for (const apiMetricFrame of apiMetricFramesList) {
        let timestampIndex = 0;
        let durationValueIndex = 1;
        const apiMetricSample = {};

        // Initialize the metric sample with empty strings
        metricKeys.forEach(key => {
            apiMetricSample[key] = '';
        });

        apiMetricFrame.schema.fields.forEach((field, fieldIndex) => {
            if (field.name === "Time") {
                timestampIndex = fieldIndex;
            }

            if (field.labels) {
                const labels = field.labels;
                if (labels.api) apiMetricSample.api = labels.api;
                if (labels.cluster) apiMetricSample.cluster = labels.cluster;
                if (labels.collection_level) apiMetricSample.collection_level = labels.collection_level;
                if (labels.error) apiMetricSample.error = labels.error;
                if (labels.method) apiMetricSample.method = labels.method;
                if (labels.org_id) apiMetricSample.org_id = labels.org_id;
                if (labels.rel_version) apiMetricSample.rel_version = labels.rel_version;
                if (labels.saas_env) apiMetricSample.saas_env = labels.saas_env;
                if (labels.service_name) apiMetricSample.service_name = labels.service_name;
                if (labels.status_code) apiMetricSample.status = labels.status_code;
                if (labels.status) apiMetricSample.status = labels.status;
                if (labels.tenant_id) apiMetricSample.tenant_id = labels.tenant_id;
                if (labels.tenant_name) apiMetricSample.tenant_name = labels.tenant_name;
            }
        });

        if (timestampIndex === 1) {
            durationValueIndex = 0;
        }

        if (apiMetricFrame.data.values.length > 0) {
            for (let itemIndex = 0; itemIndex < apiMetricFrame.data.values[timestampIndex].length; itemIndex++) {
                const timestampValue = apiMetricFrame.data.values[timestampIndex][itemIndex];
                apiMetricSample.time = format(new Date(timestampValue), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                apiMetricSample.duration = apiMetricFrame.data.values[durationValueIndex][itemIndex];

                // Append to CSV content
                csvContent += metricKeys.map(key => apiMetricSample[key]).join(',') + '\n';
            }
        }
    }
    return csvContent;
};

const collectApiMetricUsage = async (startTime, endTime, queryList) => {
    console.log(`Collecting API metric data FROM "${startTime}" TO "${endTime}"`);

    const payload = {
        queries: queryList,
        from: startTime,
        to: endTime
    };
    console.log(payload);
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grafanaToken}`
    };

    try {
        const response = await axios.post(url, payload, { headers });
        const result = response.data;

        if (!result.results) {
            console.log(JSON.stringify(result, null, 4));
            return '';
        }

        let csvContent = '';
        for (const query of queryList) {
            const apiMetricFramesList = result.results[query.refId].frames;
            csvContent += await processApiMetricFrames(apiMetricFramesList);
        }
        return csvContent;
    } catch (error) {
        console.error('Error fetching API metric usage:', error);
        return '';
    }
};

async function startRestApiMetricCollection (inputStartDate, inputEndDate, metricName, saasEnv, apiRegex, tenantName, statusCodeRegex) {
    const inputStartDateTime = parseISO(inputStartDate);
    const inputEndDateTime = parseISO(inputEndDate);

    const startTimeStr = format(inputStartDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    const endTimeStr = format(inputEndDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    console.log("Starting data collection");

    const queryList = [];
    queryList.push(
        makeQueryDict(
            "prism-public-rest-api-v2-query",
            `${metricName}{saas_env=~"${saasEnv}", api=~"${apiRegex}", tenant_name=~".*${tenantName}.*", quantile="0.95", status_code=~"${statusCodeRegex}"}`
        )
    );

    let csvContent = metricKeys.join(',') + '\n'; // CSV header
    csvContent += await collectApiMetricUsage(startTimeStr, endTimeStr, queryList);
    console.log("Completed fetching Grafana");

    return csvContent;
};

export default startRestApiMetricCollection;


// const App = () => {
//     const [data, setData] = useState('');

//     const handleFetchData = async () => {
//         const result = await startRestApiMetricCollection(
//             '2023-01-01T00:00:00Z',
//             '2023-01-02T00:00:00Z',
//             'api_metric_name',
//             'production',
//             '.*',
//             'tenantName',
//             '.*'
//         );
//         setData(result);
//     };

//     return (
//         <div>
//             <button onClick={handleFetchData}>Fetch Data</button>
//             <pre>{data}</pre>
//         </div>
//     );
// };

// export default startRestApiMetricCollection;
