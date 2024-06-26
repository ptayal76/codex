require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const hostnameProd = "https://life-cycle-manager.internal.thoughtspot.cloud";
const hostnameDev = "https://life-cycle-manager.internal.thoughtspotdev.cloud";
const hostnameStaging = "https://life-cycle-manager.internal.thoughtspotstaging.cloud";
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const prodToken = process.env.PROD_TOKEN;
const repoUrl = "https://galaxy.corp.thoughtspot.com/dev/scaligent.git";
const gcpAuth = process.env.GCP_TOKEN;

// Load environment variables
const stateToken = process.env.KIBANA_STATE_TOKEN;
const refreshToken = process.env.KIBANA_REFRESH_TOKEN;


// Main function

const fetchKibana = async (cluster_id, initial_time, end_time) => {
    // console.log({stateToken,refreshToken})
    const url = "https://vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com";
    const prodUrl = "https://vpc-cosmos-logs-vtnxecylwjjggwhuqg66jqrw6y.us-east-1.es.amazonaws.com";
    console.log(`clusterId : ${cluster_id}  initial_time: ${initial_time}   end_time: ${end_time}`);
    const payload = {
        "params": {
            "index": "tenant-*",
            "body": {
                "version": true,
                "size": 2000,
                "sort": [
                    {
                        "@timestamp": {
                            "order": "desc",
                            "unmapped_type": "boolean"
                        }
                    }
                ],
                "aggs": {
                    "2": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "calendar_interval": "1h",
                            "time_zone": "UTC",
                            "min_doc_count": 1
                        }
                    }
                },
                "stored_fields": [
                    "*"
                ],
                "script_fields": {},
                "docvalue_fields": [
                    {
                        "field": "@timestamp",
                        "format": "date_time"
                    }
                ],
                "_source": {
                    "excludes": [
                        "auto_complete"
                    ]
                },
                "query": {
                    "bool": {
                        "must": [],
                        "filter": [
                            {
                                "match_all": {}
                            },
                            {
                                "match_phrase": {
                                    "cluster_id": cluster_id
                                }
                            },
                            {
                                "range": {
                                    "@timestamp": {
                                        "gte": initial_time,
                                        "lte": end_time,
                                        "format": "strict_date_optional_time"
                                    }
                                }
                            }
                        ],
                        "should": [],
                        "must_not": []
                    }
                },
                "highlight": {
                    "pre_tags": [
                        "@kibana-highlighted-field@"
                    ],
                    "post_tags": [
                        "@/kibana-highlighted-field@"
                    ],
                    "fields": {
                        "*": {}
                    },
                    "fragment_size": 2147483647
                }
            },
            "rest_total_hits_as_int": true,
            "ignore_unavailable": true,
            "ignore_throttled": true,
            "preference": 1717735704857,
            "timeout": "60000ms"
        }
    };

    const headers = {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'cookie': `STATE-TOKEN=${stateToken}; REFRESH-TOKEN=${refreshToken}`,
        'kbn-version': '7.9.1',
        'origin': url,
        'priority': 'u=1, i',
        'referer': `${url}/_plugin/kibana/app/discover`,
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.post(`${url}/_plugin/kibana/internal/search/es`, payload, {
            headers: headers
        });

        const parsedData = response.data;
        return JSON.stringify(parsedData, null, 4);
    } catch (error) {
        console.error('Error making request:', error.message);
    }
};

async function getArchivedLogs(clusterId, userEmail, files, logDuration, services, startDate,env) {
    if (!clusterId) {
        return null;
    }
    console.log("inside");
    console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}, startDate: ${startDate}`);
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    };

    const requestBody = {
        files: files,
        logDuration: logDuration,
        services: services,
        startDate: startDate
    };
    let url;
    let options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    };

    if (env === "prod") {
        headers["Authorization"] = `Basic ${prodToken}`;
        url = `${hostnameProd}/api/v2/clusters/${clusterId}/archivedlogs`;
    } else if (env === "dev") {
        url = `${hostnameDev}/api/v2/clusters/${clusterId}/archivedlogs`;
        options.headers = {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    } else {
        url = `${hostnameStaging}/api/v2/clusters/${clusterId}/archivedlogs`;
        options.headers = {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    }

    const response = await fetch(url, options);
    const data = await response.json();
    const required_object= {
        status: response.status,
        message: data.message
    }
    return required_object;
}


async function getLogCollectionStatus(clusterId, userEmail, env) {
    if (!clusterId) {
        return null;
    }

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    };

    let url;
    let response;
    if (env === "prod") {
        headers["Authorization"] = `Basic ${prodToken}`;
        url = `${hostnameProd}/api/v2/clusters/${clusterId}/logcollection`;
        response = await fetch(url, {
            method: "GET",
            headers: headers
        });
    } else if (env === "dev") {
        url = `${hostnameDev}/api/v2/clusters/${clusterId}/logcollection`;
        headers["Authorization"] = `Basic ${btoa(username + ':' + password)}`;
        response = await fetch(url, {
            method: "GET",
            headers: headers,
        });
    } else {
        url = `${hostnameStaging}/api/v2/clusters/${clusterId}/logcollection`;
        headers["Authorization"] = `Basic ${btoa(username + ':' + password)}`;
        response = await fetch(url, {
            method: "GET",
            headers: headers,
        });
    }
    return response.status;
}

async function enableLogCollection(clusterId, userEmail, env) {
    if (!clusterId) {
        return null;
    }
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    };
    let url;
    let options = {
        method: 'POST',
        headers: headers,
    };
    if (env === "prod") {
        headers["Authorization"] = `Basic ${prodToken}`;
        url = `${hostnameProd}/api/v2/clusters/${clusterId}/logcollection/enable`;
    } else if (env === "dev") {
        url = `${hostnameDev}/api/v2/clusters/${clusterId}/logcollection/enable`;
        options.headers= {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    } else {
        url = `${hostnameStaging}/api/v2/clusters/${clusterId}/logcollection/enable`;
        options.headers = {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    }

    const response = await fetch(url, options);
    const data = await response.json();
    const required_object= {
        status: response.status,
        message: data.message
    }
    return required_object;
}

async function enableRealTimeFetchLogs(clusterId, userEmail, files, logDuration, services,env){
    console.log("inside");
    console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}`);
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Email": userEmail
    };
    const requestBody = {
        active: true,
        files: files,
        activeMinutes: logDuration,
        services: services,
    };
    let url;
    let options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    };

    if (env === "prod") {
        headers["Authorization"] = `Basic ${prodToken}`;
        url = `${hostnameProd}/api/v2/clusters/${clusterId}/realtimelogs`;
    } else if (env === "dev") {
        url = `${hostnameDev}/api/v2/clusters/${clusterId}/realtimelogs`;
        options.headers = {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    } else {
        url = `${hostnameStaging}/api/v2/clusters/${clusterId}/realtimelogs`;
        options.headers = {
            ...headers,
            "Authorization": `Basic ${btoa(username + ':' + password)}`
        };
    }
    const response = await fetch(url, options);
    const data = await response.json();
    const required_object= {
        status: response.status,
        message: data.message
    }
    return required_object;
}

// Call the main function with appropriate arguments
module.exports = {fetchKibana, getArchivedLogs, getLogCollectionStatus, enableLogCollection, enableRealTimeFetchLogs}
