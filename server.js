const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
// const pythonExecutable = '/usr/local/bin/python3'; // Replace with your actual path
const pythonExecutable = '/opt/homebrew/bin/python3.11'; // Replace with your actual path
//const pythonExecutable = '/usr/bin/python3'; // Replace with your actual path

app.post('/trigger-kibana',(req, res) => {
  const {
    clusterId,
    initialTime, 
    endTime,
    msg
  } = req.body;

  const fullPath = path.join(__dirname, 'cluster_scripts/final-script.py');

  const pythonProcess = spawn(pythonExecutable, [fullPath, '--cluster_id',clusterId,'--initial_time', initialTime, '--end_time', endTime, '--msg', msg]);
  pythonProcess.stdout.on('data', (data) => {
      console.log(data);
  });
  const JSONFilePath = './Kibana.txt';
  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    fs.readFile(JSONFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error(`readFile error: ${err}`);
        return res.status(500).json({ error: err.message });
      }
      res.json({ json: fileData });
      
      // cleanup
      console.log(fileData);
    });
  });
});

app.get('/', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.post('/run-grafana-script', (req, res) => {
  const {
    input_start_date,
    input_end_date,
    tenantName
  } = req.body;
  console.log(req.body);
  const scriptPath = path.join(__dirname, 'grafana_logs', 'grafana_script.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--input_start_date', input_start_date, '--input_end_date', input_end_date, '--metricName', 'request_duration_seconds', '--saasEnv', 'staging|prod', '--apiRegex', '.*', '--tenantName', tenantName, '--statusCodeRegex', '4.*|5.*', '--grafana_session', `grafana_session=394f57efee55330070b5b4643875329e`]);
  pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script stdout: ${data}`);
      var string = data + '';
      const logsArray=string.split('\n');
      const csvFilePathLine = logsArray.find(line => line.includes('data save path:'));
      if (!csvFilePathLine) {
        return res.status(500).json({ error: 'CSV file path not found in logs' });
      }
      const csvFilePath = csvFilePathLine.split('data save path: ')[1].trim();
      fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`readFile error: ${err}`);
          return res.status(500).json({ error: err.message });
        }
  
        res.json({ csvContent: data });
      });
  });
  pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
  });
});
app.get('/commands-array', (req, res) => {
  fs.readFile('./sandbox/cluster_scripts/commands.txt', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error reading file');
      } else {
          // Remove leading and trailing brackets and quotes
          const stringArray = data.slice(2, -2).split("', '");
          res.json(stringArray);
      }
  });
});
app.get('/patches-array', (req, res) => {
  fs.readFile('./sandbox/cluster_scripts/appliedPatches.txt', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error reading file');
      } else {
          // Remove leading and trailing brackets and quotes
          const stringArray = data.slice(2, -2).split("', '");
          res.json(stringArray);
      }
  });
});

app.post('/run-AWS-cluster', (req,res) => {
  const {
    cluster_name,
    owner_email,
  } = req.body;
  console.log(req.body);
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex_metrics.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--owner_email', owner_email, '--scenario_type', 3]);
  pythonProcess.stdout.on('data', () => {
      return res.status(200).json({status: "Successfull"});
  });
  pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
  });
})

app.post('/run-GCP-cluster', (req,res) => {
  const {
    cluster_name,
    owner_email,
  } = req.body;
  console.log(req.body);
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex_metrics.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--owner_email', owner_email, '--scenario_type', 2]);
  pythonProcess.stdout.on('data', () => {
      return res.status(200).json({status: "Successfull"});
  });
  pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
  });
})

app.post('/run-check-cluster-script', (req, res) => {
  const {
    cluster_name
  } = req.body;
  console.log(cluster_name);
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex_metrics.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--scenario_type', 1]);
  console.log("Starting Python script...");

  let scriptOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    scriptOutput += data.toString();
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    if (code === 0) {
      console.log("Script run successfully");
      res.status(200).json({ status: "Successful" });
    } else {
      res.status(500).json({ status: "Error", error: `Python script exited with code ${code}` });
    }
  });

  pythonProcess.on('error', (err) => {
    console.error(`Failed to start Python script: ${err}`);
    res.status(500).json({ status: "Error", error: `Failed to start Python script: ${err.message}` });
  });
});

app.post('/trigger-kibana',(req, res) => {
  const {
    clusterId,
    initialTime, 
    endTime,
    msg
  } = req.body;


  console.log(req.body)
  // const fullPath = path.join(__dirname, 'cluster_scripts/CorsCSP.py');
  const fullPath = path.join(__dirname, 'Kibana/final-script.py');

  const pythonProcess = spawn(pythonExecutable, [fullPath, '--cluster_id',clusterId,'--initial_time', initialTime, '--end_time', endTime, '--msg', msg]);
  pythonProcess.stdout.on('data', (data) => {
      console.log("test : " + data);
  });

  const JSONFilePath = './Kibana.txt';
  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    fs.readFile(JSONFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error(`readFile error: ${err}`);
        return res.status(500).json({ error: err.message });
      }
      res.json({ json: fileData });
      console.log(fileData);
    });
  });
});

app.post('/check-csp-cors-validation', (req, res) => {
  const { cluster_url, domain } = req.body;
  console.log("cluster_url : ", cluster_url);
  console.log("domain: ", domain);
  const fullPath = path.join(__dirname, 'cluster_scripts/CorsCSP.py');
  const pythonProcess = spawn(pythonExecutable, [fullPath,cluster_url, domain]);
  console.log("Python script started");
  // pythonProcess.stdout.on('data', (data) => {
  //   console.log("Output from Python script: ", data);
  // });
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script stderr: ${data}`);
});

  const JSONFilePath = './CorsCsp.txt';
  pythonProcess.on('close', (code) => {
    fs.readFile(JSONFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error(`readFile error: ${err}`);
        return res.status(500).json({ error: err.message });
      }
      res.json(fileData);
      // cleanup
      console.log("fileData:", fileData);
    });
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
