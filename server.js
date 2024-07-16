const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { default: cluster } = require("cluster");
const { JSDOM } = require('jsdom');
const {
  getAllClusterInfo,
  getFlagDetails,
  createAWSSaasCluster,
  applyPatches,
  applyTSCLICommands,
  createGCPSaasCluster,
  getClusterDetails,
  getClusterCommandsPatches
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
//   fetch("https://vpc-cosmos-logs-4wtep3mnjhirrckhgaaqedsrtq.us-west-2.es.amazonaws.com/_plugin/kibana/app/kibana?code=4aa594d5-921c-4fa7-aa1a-5212d5df5ec7&state=2dd6aee8-0e47-42ab-82b1-0da590f6cc10", {
//   headers: {
//     accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//     priority: "u=0, i",
//     "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "cross-site",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     cookie: "STATE-TOKEN=2dd6aee8-0e47-42ab-82b1-0da590f6cc10"
//   },
//   referrerPolicy: "strict-origin-when-cross-origin",
//   body: null,
//   method: "GET"
// })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return response;  // Assuming the response is HTML
//   })
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
  
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

app.post("/get-cluster-patches-commands", async (req,res) => {
  const { cname, cenv } = req.body; // Assuming clusterid and env are passed as query parameters
  console.log("recieved: ", req.body);
  console.log(`clusterName: ${cname}  env: ${cenv}` );
  try {
    const {
      commands,
      currentVersion,
      upgradeVersion,
      patches
    } = await getClusterCommandsPatches(cname,cenv);
    const response = {
      commands,
      currentVersion,
      upgradeVersion,
      patches
    };
    res.json(response);
    console.log("response: ", response);
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
    console.log("csp cors response: ",response);
    res.json(response); // Send the response as JSON
  } catch (error) {
    console.log("res error:: ", error);
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

app.post("/trigger-okta", async (req, res)=>{
  const {username , password}= req.body;
  console.log("user: ", username);
  console.log("pass: ", password);
  const url= "https://thoughtspot.okta.com/api/v1/authn";
  const requestBody= {
    username: `${username}`,
    password: `${password}`,
    options: {
      multiOptionalFactorEnroll: true,
      warnBeforePasswordExpired: true
    }
  };
  const options= {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  const response = await fetch(url,options);
  const data = await response.json();
  console.log("recieved data:: ", data);
  if(data?.status==="SUCCESS"){
    const sessionToken = data.sessionToken;
    const authurl = `https://trial-6881328.okta.com/oauth2/v1/authorize?client_id=0oafv1rpjlFgvFw9g697&response_type=code&response_mode=form_post&scope=openid&redirect_uri=http://localhost:5173/login/callback&state=someRandomState&nonce=test1&sessionToken=${sessionToken}&code_challenge=qjrzSW9gMiUgpUvqgEPE4_-8swvyCtfOVvg55o5S_es&code_challenge_method=S256`;
    const authorize = await fetch(authurl,{
      method: 'GET'
    })
    const htmlrecieved= await authorize.text();
    console.log("authdata:: ", htmlrecieved);
    if(htmlrecieved){
      const dom = new JSDOM(htmlrecieved);
      const document = dom.window.document;
      // Extract the value of the "code" input field
      const code = document.querySelector('input[name="code"]').value;
      console.log('Extracted code:', code);
      const tokenURL= "https://trial-6881328.okta.com/oauth2/v1/token";
      const tokenbody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '0oafv1rpjlFgvFw9g697',
        redirect_uri: 'http://localhost:5173/login/callback',
        code: code,
        code_verifier: 'M25iVXpKU3puUjFaYWg3T1NDTDQtcW1ROUY5YXlwalNoc0hhakxifmZHag'
      });
      
      const tokenResponse = await fetch(tokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: tokenbody.toString()
      });
      const tokens= await tokenResponse.json();
      console.log("tokens:: ", tokens);
      res.json(tokens);
    }
  }
  else if(data.status==="MFA_REQUIRED"){
    const stateToken = data.stateToken;
    const factorId= data['_embedded'].factors[0].id;
    console.log(`factorId: ${factorId}, `);
    const mfaUrl= `https://thoughtspot.okta.com/api/v1/authn/factors/${factorId}/verify`;
    const mfaBody ={
      stateToken : stateToken
    }
    const resp = await fetch(mfaUrl,{
      method :'POST',
      body: JSON.stringify(mfaBody),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const jsdata= await resp.json();
    console.log("jsframe:: ", jsdata);
    res.json(jsdata);
  }
});

  app.post('/duo-complete',async (req,res)=>{
    console.log("recieved :: ", req.body);
    const {sig_response, stateToken}= req.body;
    const response = await fetch('https://thoughtspot.okta.com/api/v1/authn/factors/dsf14k4l7elGB3Ux70x8/lifecycle/duoCallback', {
      method: 'POST',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'cache-control': 'max-age=0',
        'content-type': 'application/x-www-form-urlencoded',
        'priority': 'u=0, i',
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"14.5.0"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      body: `stateToken=${encodeURIComponent(stateToken)}&sig_response=${encodeURIComponent(sig_response)}`
    })
    if(response){
      console.log("response :::", response);
      res.redirect(`http://localhost:3000/admin/debug/kibana-logs/authenticateKibana`);
      const url= "https://thoughtspot.okta.com/api/v1/authn/factors/dsf14k4l7elGB3Ux70x8/verify"
      const body= {
        stateToken : stateToken
      }
      const verifyResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await verifyResponse.json();
      console.log("data:: ", data);
    }
    
  });
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
  module.exports = {app};