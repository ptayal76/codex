const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs= require('fs');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
const pythonExecutable = '/usr/local/bin/python3'; // Replace with your actual path

// Path to your Python executable on macOS
const pythonExecutable = '/usr/bin/python3'; // Replace with your actual path

app.post('/trigger-kibana',(req, res) => {
  const {
    clusterId,
    initialTime, 
    endTime,
    msg
  } = req.body;


  const fullPath = path.join(__dirname, '/Kibana/final-script.py');

  const pythonProcess = spawn(pythonExecutable, [fullPath, '--cluster_id',clusterId,'--initial_time', initialTime, '--end_time', endTime, '--msg', msg]);
  pythonProcess.stdout.on('data', (data) => {
      console.log(data);
  });

  const JSONFilePath = './kibana.json';
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

app.post('/run-script', (req, res) => {
  const {
    input_start_date,
    input_end_date,
    metricName,
    saasEnv,
    apiRegex,
    tenantName,
    statusCodeRegex,
    grafana_session
  } = req.body;
  console.log(req.body);
  const scriptPath = path.join(__dirname, 'grafana_logs', 'grafana_script.py');
  // const command1 =  `source ../env/bin/activate`;
  // exec(command1,(error,stdout,stderr) => {
  //   if (error) {
  //     console.error(`exec error: ${error}`);
  //     return res.status(500).json({ error: stderr });
  //   }
  // })
  console.log(scriptPath);
  // const command = `python3 ${scriptPath} --input_start_date ${input_start_date} --input_end_date ${input_end_date} --metricName ${metricName} --saasEnv ${saasEnv} --apiRegex ${apiRegex} --tenantName ${tenantName} --statusCodeRegex ${statusCodeRegex} --grafana_session grafana_session=${grafana_session}`;
  const pythonProcess = spawn(pythonExecutable, [scriptPath, '--input_start_date', input_start_date, '--input_end_date', input_end_date, '--metricName', metricName, '--saasEnv', saasEnv, '--apiRegex', apiRegex, '--tenantName', tenantName, '--statusCodeRegex', statusCodeRegex, '--grafana_session', `grafana_session=${grafana_session}`]);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
