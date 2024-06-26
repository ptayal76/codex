const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { default: cluster } = require("cluster");

const {
  getAllClusterInfo,
  getFlagDetails,
  createAWSSaasCluster,
  applyPatches,
  applyTSCLICommands,
  createGCPSaasCluster,
  getClusterDetails,
  getClusterOtherDetails
} = require("./clusterFunctions.js"); // Replace 'yourFileName' with the actual filename where getAllClusterInfo is defined
const { startRestApiMetricCollection } = require("./grafana_functions.js");
const { fetchKibana, getArchivedLogs, getLogCollectionStatus, enableLogCollection, enableRealTimeFetchLogs } = require("./kibana_functions.js");
const { CheckCorsCSP } = require("./corsCSP_functions.js");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
// const pythonExecutable = "/usr/local/bin/python3"; // Replace with your actual path
// const pythonExecutable = '/opt/homebrew/bin/python3.11'; // Replace with your actual path
//const pythonExecutable = '/usr/bin/python3'; // Replace with your actual path

//kibana API's
app.get("/", (req, res) => {
  console.log("hi");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.send();
  }
  res.json({ message: "Hello from the backend!" });
});

app.get("/api/v1/emojies", (req, res) => {
  console.log("hi");
  res.json({ message: [1,2,3,4] });
});
app.post("/trigger-kibana", async (req, res) => {
  const { Cluster_Name, StartTimestamp, EndTimestamp, Env } = req.body;
  console.log(Cluster_Name);
  console.log(StartTimestamp);
  console.log(EndTimestamp);
  console.log(Env);
  const kibanaData = await fetchKibana(Cluster_Name, StartTimestamp, EndTimestamp, Env);
  res.json(kibanaData);
  console.log("kibaana data:: ", kibanaData);
});
app.post("/fetch-archived-logs", async (req,res)=>{
  const { clusterId, userEmail, files, logDuration, services, startDate, env } =req.body;
  console.log("fetch-archived-logs triggered");
  console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}, startDate: ${startDate}, env: ${env}`);
  const date = new Date(startDate);
  const unixTimestamp = Math.floor(date.getTime() / 1000);
  console.log("unixTimeStamp : ", unixTimestamp);
  const archivedLogsStatus= await getArchivedLogs(clusterId, userEmail, files,logDuration, services, unixTimestamp, env);
  res.json(archivedLogsStatus);
  console.log("archivedLogsStatus: ", archivedLogsStatus);
})
app.post("/fetch-real-time-logs", async (req,res)=>{
  const { clusterId, userEmail, files, logDuration, services, env } =req.body;
  console.log("fetch-realTime-logs triggered");
  console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}, env: ${env}`);
  const realTimeLogsStatus= await enableRealTimeFetchLogs(clusterId, userEmail, files,logDuration, services, env);
  res.json(realTimeLogsStatus);
  console.log("realTimeLogsStatus: ", realTimeLogsStatus);
})
// app.post("/fetch-real-time-logs", async (req,res)=>{
//   const { clusterId, userEmail} =req.body;
//   console.log("fetch-realTime-logs triggered");
//   console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}, env: ${env}`);
//   const realTimeLogsStatus= await enableRealTimeFetchLogs(clusterId, userEmail, files,logDuration, services, env);
//   res.json(realTimeLogsStatus);
//   console.log("realTimeLogsStatus: ", realTimeLogsStatus);
// })
// app.post("/fetch-real-time-logs", async (req,res)=>{
//   const { clusterId, userEmail } =req.body;
//   console.log("fetch-realTime-logs triggered");
//   console.log(`clusterId: ${clusterId}, useremail: ${userEmail}, files: ${files}, logDuration: ${logDuration}, services : ${services}, env: ${env}`);
//   const realTimeLogsStatus= await enableRealTimeFetchLogs(clusterId, userEmail, files,logDuration, services, env);
//   res.json(realTimeLogsStatus);
//   console.log("realTimeLogsStatus: ", realTimeLogsStatus);
// })

app.post("/run-grafana-script", async (req, res) => {
  const { input_start_date, input_end_date, tenantName } = req.body;
  console.log(req.body);
  const metricName = "request_duration_seconds";
  const saasEnv = "staging|prod";
  const apiRegex = ".*";
  const statusCodeRegex = "2.*|4.*|5.*";
  try {
    const csvContent = await startRestApiMetricCollection(
      input_start_date,
      input_end_date,
      metricName,
      saasEnv,
      apiRegex,
      tenantName,
      statusCodeRegex
    );
    
    res.json({ csvContent: csvContent });
    // });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});
app.get("/commands-array", (req, res) => {
  fs.readFile("./sandbox/cluster_scripts/commands.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading file");
    } else {
      // Remove leading and trailing brackets and quotes
      const stringArray = data.slice(2, -2).split("', '");
      res.json(stringArray);
    }
  });
});
app.get("/patches-array", (req, res) => {
  fs.readFile(
    "./sandbox/cluster_scripts/appliedPatches.txt",
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error reading file");
      } else {
        // Remove leading and trailing brackets and quotes
        const stringArray = data.slice(2, -2).split("', '");
        res.json(stringArray);
      }
    }
  );
});

app.post("/run-AWS-cluster", async (req, res) => {
  const { cluster_name, owner_email, image_tag } = req.body;
  const feature = "TS Diag Portal";
  const team = "ts-everywhere";
  console.log(
    `Creating AWS cluster: ${cluster_name}, ${owner_email}, ${image_tag}`
  );
  try {
    const status = await createAWSSaasCluster(
      cluster_name,
      owner_email,
      image_tag,
      feature,
      team
    );
    if (status >= 200 && status < 300) {
      res.status(200).json({ status: "Successful" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error creating AWS cluster:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/run-GCP-cluster", async (req, res) => {
  const { cluster_name, owner_email, image_tag } = req.body;
  console.log(
    `Creating GCP cluster: ${cluster_name}, ${owner_email}, ${image_tag}`
  );
  try {
    const status = await createGCPSaasCluster(
      cluster_name,
      owner_email,
      image_tag
    );
    if (status >= 200 && status < 300) {
      res.status(200).json({ status: "Successful" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error creating GCP cluster:", error);
    res.status(500).json({ error: "Internal server error" });
  }

  // const scriptPath = path.join(
  //   __dirname,
  //   "cluster_scripts",
  //   "codex-metrics-final.py"
  // );
  // console.log(scriptPath);
  // const pythonProcess = spawn(pythonExecutable, [
  //   scriptPath,
  //   "--cluster_name",
  //   cluster_name,
  //   "--owner_email",
  //   owner_email,
  //   "--scenario_type",
  //   2,
  //   "--image_tag",
  //   image_tag,
  // ]);
  // pythonProcess.stdout.on("data", () => {
  //   return res.status(200).json({ status: "Successfull" });
  // });
  // pythonProcess.stderr.on("data", (data) => {
  //   console.error(`Python script stderr: ${data}`);
  // });
  // pythonProcess.on("close", (code) => {
  //   console.log(`Python script exited with code ${code}`);
  //   if (code === 0) {
  //     console.log("Script run successfully");
  //     fs.readFile("./sandbox/cluster_scripts/gcp.txt", "utf8", (err, data) => {
  //       if (err) {
  //         console.error(err);
  //         res.status(500).send("Error reading file");
  //       } else {
  //         // Remove leading and trailing brackets and quotes
  //         if (data == "201") {
  //           res.status(200).json({ status: "Successful" });
  //         } else {
  //           res
  //             .status(500)
  //             .json({ status: "Error", error: `Cluster not created` });
  //         }
  //       }
  //     });
  //   } else {
  //     res.status(500).json({
  //       status: "Error",
  //       error: `Python script exited with code ${code}`,
  //     });
  //   }
  // });
});

app.post("/get-cluster-details", async (req,res) => {
  const { cluster_name, env } = req.body; // Assuming clusterName and env are passed as query parameters
  console.log(cluster_name, env);
  try {
    const {clusterId,clusterDetails} = await getClusterDetails(cluster_name,env);
    if(!clusterId){
      res.status(404).json({ error: `Cluster ${cluster_name} not found` });
    }
    const response = {
      clusterId,
      clusterDetails
    };
    res.json(response);
  } catch (error) {
    console.error("Error getting cluster details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.post("/get-cluster-other-details", async (req,res) => {
  const { cluster_id, env } = req.body; // Assuming clusterid and env are passed as query parameters
  console.log(cluster_id, env);
  try {
    const {commands,
      currentVersion,
      upgradeVersion,
      patches} = await getClusterOtherDetails(cluster_id,env);
    const response = {
      commands,
      currentVersion,
      upgradeVersion,
      patches
    };
    res.json(response);
  } catch (error) {
    console.error("Error getting cluster other details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.post("/get-cluster-flags", async (req,res) => {
  const { cluster_id, env } = req.body; // Assuming clusterid and env are passed as query parameters
  console.log(cluster_id, env);
  try {
    const flagDetails = await getFlagDetails(cluster_id,env);
    const response = {
      flagsData: flagDetails,
    };
    res.json(response);
  } catch (error) {
    console.error("Error getting cluster flags: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.post("/get-cluster-info", async (req, res) => {
  const { cluster_name, env } = req.body; // Assuming clusterName and env are passed as query parameters
  console.log(cluster_name, env);
  try {
    const clusterInfo = await getAllClusterInfo(cluster_name, env);
    if (!clusterInfo) {
      res.status(404).json({ error: `Cluster ${cluster_name} not found` });
    }
    const {
      clusterId,
      clusterDetails,
      commands,
      currentVersion,
      upgradeVersion,
      patches,
    } = clusterInfo;
    const flagDetails = await getFlagDetails(clusterId, env);
    // console.log({ clusterInfo, flagDetails })
    const responseData = {
      clusterId,
      clusterDetails,
      commands,
      currentVersion,
      upgradeVersion,
      patches,
      flagsData: flagDetails, // Assuming this is part of your data structure
    };
    
    res.json(responseData); // Send the combined data in response
  } catch (error) {
    console.error("Error running check cluster script:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/check-csp-cors-validation", async (req, res) => {
  const { cluster_url, domain } = req.body;
  console.log("cluster_url : ", cluster_url);
  console.log("domain: ", domain);

  try {
    const response = await CheckCorsCSP(cluster_url, domain);
    console.log(response)
    res.json(response); // Send the response as JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});
app.post("/apply-patch", async (req, res) => {
  const { owner_email, cluster_name, patch, env } = req.body;
  console.log(cluster_name);
  console.log(owner_email);
  console.log(patch);
  console.log(env);

  const status = await applyPatches(cluster_name, owner_email, patch, env);
  if (status == 200) {
    res.status(200);
  } else {
    console.error("Error Applying Patch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/apply-commands", async (req, res) => {
  const { owner_email, cluster_name, commands, env } = req.body;
  console.log(
    "owner-email: ",
    owner_email,
    " cluster_name: ",
    cluster_name,
    " commands: ",
    commands,
    " env: ",
    env
  );
  const status = await applyTSCLICommands(
    cluster_name,
    owner_email,
    commands,
    env
  );
  if (status == 200) {
    res.status(200);
  } else {
    console.error("Error Applying Patch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
  module.exports = {app};