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
const pythonExecutable = '/usr/local/bin/python3'; // Replace with your actual path

const tabsData = [
  { id: 1, content: 'Content for Tab 1: Some text and information.' },
  { id: 2, content: 'Content for Tab 2: Some list items.' },
  { id: 3, content: 'Content for Tab 3: Some image or other data.' },
];

const scrollableData = [
  { id: 1, message: 'Scrollable message 1' },
  { id: 2, message: 'Scrollable message 2' },
  { id: 3, message: 'Scrollable message 3' },
];

const styledData = {
  title: 'Styled Component Title',
  description: 'Description for styled component.',
};

const responsiveData = [
  { id: 1, name: 'John Doe', age: 28 },
  { id: 2, name: 'Jane Doe', age: 25 },
];

const searchData = [
  {
    title: 'Result for query 1',
    link: '#',
    description: 'This is a description for result 1.',
  },
  {
    title: 'Result for query 2',
    link: '#',
    description: 'This is a description for result 2.',
  },
];

app.get('/api/tabs', (req, res) => {
  res.json(tabsData);
});

app.get('/api/scrollable', (req, res) => {
  res.json(scrollableData);
});

app.get('/api/styled', (req, res) => {
  res.json(styledData);
});

app.get('/api/responsive', (req, res) => {
  res.json(responsiveData);
});

app.get('/api/search', (req, res) => {
  const query = req.query.q;
  const results = searchData.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );
  res.json(results);
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
