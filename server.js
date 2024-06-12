const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { default: cluster } = require('cluster');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
const pythonExecutable = '/usr/local/bin/python3'; // Replace with your actual path
// const pythonExecutable = '/opt/homebrew/bin/python3.11'; // Replace with your actual path
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
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--input_start_date', input_start_date, '--input_end_date', input_end_date, '--metricName', 'request_duration_seconds', '--saasEnv', 'staging|prod', '--apiRegex', '.*', '--tenantName', tenantName, '--statusCodeRegex', '2.*|4.*|5.*']);
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
    image_tag
  } = req.body;
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex-metrics-final.py');
  // console.log(scriptPath);
  console.log(cluster_name)
  console.log(owner_email)
  console.log(image_tag)
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--owner_email', owner_email, '--scenario_type', 3, '--image_tag', image_tag]);
  // const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', 'champagne-master-aws-clone2', '--owner_email', 'piyush.tayal@thoughtspot.com', '--scenario_type', 3, '--image_tag', '9.12.5.cl-220']);
  pythonProcess.stdout.on('data', (data) => {
      console.log(data)
  });
  pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
  });
  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    if (code === 0) {
      console.log("Script run successfully");
      fs.readFile('./sandbox/cluster_scripts/aws.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading file');
        } else {
            // Remove leading and trailing brackets and quotes
            if(data=='201'){
              res.status(200).json({ status: "Successful" });
            }else{
              res.status(500).json({ status: "Error", error: `Cluster not created` });
            }
        }
    });
    } else {
      res.status(500).json({ status: "Error", error: `Python script exited with code ${code}` });
    }
  });
})

app.post('/run-GCP-cluster', (req,res) => {
  const {
    cluster_name,
    owner_email,
    image_tag
  } = req.body;
  console.log(req.body);
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex-metrics-final.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--owner_email', owner_email, '--scenario_type', 2, '--image_tag', image_tag]);
  pythonProcess.stdout.on('data', () => {
      return res.status(200).json({status: "Successfull"});
  });
  pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
  });
  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    if (code === 0) {
      console.log("Script run successfully");
      fs.readFile('./sandbox/cluster_scripts/gcp.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading file');
        } else {
            // Remove leading and trailing brackets and quotes
            if(data=='201'){
              res.status(200).json({ status: "Successful" });
            }else{
              res.status(500).json({ status: "Error", error: `Cluster not created` });
            }
        }
    });
    } else {
      res.status(500).json({ status: "Error", error: `Python script exited with code ${code}` });
    }
  });
})

app.post('/run-check-cluster-script', (req, res) => {
  const {
    cluster_name,
    env
  } = req.body;
  console.log(cluster_name);
  console.log(env);
  const scriptPath = path.join(__dirname, 'cluster_scripts', 'codex-metrics-final.py');
  console.log(scriptPath);
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--cluster_name', cluster_name, '--scenario_type', 1,'--env',env]);
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
    console.log("status code of python script API: ", scriptOutput);
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
app.post('/apply-patch',(req,res)=>{
  const {
    owner_email,
    cluster_name,
    patch,
    env
  }= req.body;
  const fullPath = path.join(__dirname, 'cluster_scripts/codex_metrics-final.py');
  const pythonProcess = spawn(pythonExecutable, [fullPath,"--cluster_name",cluster_name,"--owner_email", owner_email, "--patches", patch, "--scenario_type",4,"--env", env]);
  let scriptOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    scriptOutput += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script stderr: ${data}`);
  });

  const JSONFilePath = './sandbox/cluster_scripts/patched.txt';
  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    console.log("ApplyPatchscript Output:",scriptOutput);
    fs.readFile(JSONFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error(`readFile error: ${err}`);
        return res.status(500).json({ error: err.message });
      }
    
      try {
        res.send(fileData.toString()); // Send the parsed data as JSON response
      } catch (parseErr) {
        console.error(`JSON parse error: ${parseErr}`);
        return res.status(500).send({ error: 'Failed to parse JSON' });
      }
    
      // cleanup
      console.log("fileData:", fileData);
    });
  });
});

app.post('/apply-commands',(req,res)=>{
  const {
    owner_email,
    cluster_name,
    commands,
    env
  }= req.body;
  // console.log("owner-email: ", owner_email, " cluster_name: ", cluster_name, " commands: ", commands, " env: ",env);
  const fullPath = path.join(__dirname, 'cluster_scripts/codex-metrics-final.py');
  const pythonProcess = spawn(pythonExecutable, [
    fullPath,
    '--cluster_name', cluster_name,
    '--owner_email', owner_email,
    '--run_cmds', commands[0],
    '--scenario_type',5,
    '--env', env
  ]);
  let scriptOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    scriptOutput += data.toString();
  });
  console.log("scriptoutput: ", scriptOutput);
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script stderr: ${data}`);
  });

  const JSONFilePath = './sandbox/cluster_scripts/cmds_run.txt';
  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    console.log("ApplyCommandscript Output:",scriptOutput);
    fs.readFile(JSONFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error(`readFile error: ${err}`);
        return res.status(500).json({ error: err.message });
      }
    
      try {
        res.send(fileData.toString()); // Send the parsed data as JSON response
      } catch (parseErr) {
        console.error(`JSON parse error: ${parseErr}`);
        return res.status(500).send({ error: 'Failed to parse JSON' });
      }
    
      // cleanup
      console.log("fileData:", fileData);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
