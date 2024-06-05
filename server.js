const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
