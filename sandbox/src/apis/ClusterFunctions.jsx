import { useGlobalState } from "../GlobalState.jsx";
import axios from "axios";

async function getClusterDetails(clusterName, env) {
  //   const {
  //       hostnameDev,
  //       hostnameProd,
  //       hostnameStaging,
  //       username,
  //       password,
  //       headers,
  //       headersProd
  //   } = useGlobalState();
  const hostnameDev = import.meta.env.VITE_HOSTNAME_DEV;
  const hostnameProd = import.meta.env.VITE_HOSTNAME_PROD;
  const hostnameStaging = import.meta.env.VITE_HOSTNAME_STAGING;
  const username = import.meta.env.VITE_USERNAME;
  const password = import.meta.env.VITE_PASSWORD;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const headersProd = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${import.meta.env.VITE_PROD_TOKEN}`,
  };
  console.log("hi");
  let page = 0;
  const size = 100;
  let clusterStateList = true;
  let clusterDetails = null;
  let clusterId = null;

  try {
    while (clusterStateList) {
      let url;
      let response;

      if (env === "prod") {
        url = `${hostnameProd}/api/v2/clusters/state?page=${page}&size=${size}`;
        response = await axios.get(url, {
          headers: headersProd,
        });
      } else {
        url = `${
          env === "dev" ? hostnameDev : hostnameStaging
        }/api/v2/clusters/state?page=${page}&size=${size}`;
        response = await axios.get(url, {
          auth: {
            username: username,
            password: password,
          },
          headers: headers,
        });
      }

      clusterStateList = response.data.clusterStateList;

      if (!clusterStateList || clusterStateList.length === 0) {
        break;
      }

      for (const cluster of clusterStateList) {
        if (
          cluster.clusterName === clusterName &&
          cluster.operationalState !== "DELETE"
        ) {
          clusterId = cluster.clusterId;
          clusterDetails = cluster;
        }
      }

      page += 1;
    }

    if (!clusterId) {
      console.log(`Cluster ${clusterName} not found`);
      return null;
    }

    return { clusterId, clusterDetails };
  } catch (error) {
    console.error(`Error fetching cluster details: ${error.message}`);
    throw error; // Re-throw the error after logging it
  }
}

export default getClusterDetails;
